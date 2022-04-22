import * as ethers from 'ethers'
import { TransactionManager } from '../util/TransactionManager'
import AddressWidget from '../component/addressWidget'
import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import Button from 'react-bootstrap/Button'

import {
  createAllCard
} from '../game/card'

import {
  createWithManagerContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  updateStep,
  setMessage,
  setError,
  getStep,
  StepId,
  Step,
  isStep,
  resetAllStep,
  resetAllSubStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const AdminContract = (props : {
  transactionManager : TransactionManager,
  contract ?: ethers.Contract,
  setContract : (contract : ethers.Contract | undefined) => void,
  networkName : string,
}) => {
  const stepId = StepId.Contract
  const step = useAppSelector((state) => state.contractSlice.step)
  const dispatch = useAppDispatch()

  const _setMessage = (message : string | undefined) => {
    dispatch(setMessage({id : stepId, message : message}))
  }

  const fillContract = (contract : ethers.Contract) => {
    dispatch(updateStep({id: stepId, step: Step.Creating}))
    createAllCard(contract, props.transactionManager, _setMessage).then(() => {
      dispatch(updateStep({id: stepId, step: Step.Ok}))
    }).catch((err) => {
      dispatch(setError({id : stepId, catchError : err}))
    })
  }

  const createContract = () => {
    dispatch(updateStep({id: stepId, step: Step.Creating}))
    createWithManagerContractCardAdmin(props.transactionManager).then(async (contract) => {
      props.setContract(contract)
      dispatch(resetAllSubStep())
      fillContract(contract)
    }).catch((err) => {
      dispatch(setError({id : stepId, catchError : err}))
    })
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title="Contract" hide={false}>
      { !!props.contract &&
        <SpaceWidget>Contract <AddressWidget
          address={props.contract.address}
        /> on {props.networkName}</SpaceWidget>
      }
      <StepMessageWidget
        step = {getStep(stepId, step)}
      />
      { (isStep(stepId, Step.NotSet, step) || isStep(stepId, Step.Ok, step)) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {props.contract && createContract()}}>
          Create new game contract on {props.networkName}
        </Button>
        </SpaceWidget>
      }
      { isStep(stepId, Step.Empty, step) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {props.contract && fillContract(props.contract)}}>
          Fill new game contract on {props.networkName}
        </Button>
        </SpaceWidget>
      }
      <SpaceWidget>
      <Button variant="warning" onClick={() => {
        props.setContract(undefined)
        dispatch(resetAllStep())
      }}>
        Reload all
      </Button>
      </SpaceWidget>
    </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default AdminContract

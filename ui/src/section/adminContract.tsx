import * as ethers from 'ethers'
import { TransactionManager } from '../util/TransactionManager'
import AddressWidget from '../component/addressWidget'
import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import Button from 'react-bootstrap/Button'

import {
  clearState,
  createContract,
  fillContract,
} from '../game/reducer/contract'

import {
  registerTrading,
} from '../game/card'

import {
  createWithManagerContractPlayGameFactory,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  updateStep,
  setError,
  clearError,
  getStep,
  StepId,
  Step,
  isStep,
  resetAllStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const AdminContract = (props : {
  transactionManager : TransactionManager,
  contract ?: ethers.Contract,
  setContract : (contract : ethers.Contract | undefined) => void,
}) => {
  const stepId = StepId.Contract
  const step = useAppSelector((state) => state.contractSlice.step)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const updateContractGameFactory = () => {
    if (props.contract){
      dispatch(updateStep({id: stepId, step: Step.Creating}))
      createWithManagerContractPlayGameFactory(props.transactionManager).then(
        async (contractFactory) => {
          if (props.contract){
            try {
              await props.transactionManager.sendTx(
                await props.contract.populateTransaction.updatePlayGameFactory(
                  contractFactory.address
                ), "Update play game contract")
              dispatch(updateStep({id: stepId, step: Step.Ok}))
            } catch (err : any) {
              dispatch(setError({id : stepId, catchError : err}))
            }

          }
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
    }
  }

  const updateContractTrading = () => {
    if (props.contract){
      dispatch(updateStep({id: stepId, step: Step.Creating}))
      registerTrading(props.contract, props.transactionManager).then(() => {
          dispatch(updateStep({id: stepId, step: Step.Ok}))
          dispatch(updateStep({id: StepId.Trading, step: Step.Init}))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title="Contract" hide={false}>
      { !!props.contract &&
        <SpaceWidget>Contract <AddressWidget
          address={props.contract.address}
        /> on {network?.name}</SpaceWidget>
      }
      <StepMessageWidget
        step = {getStep(stepId, step)}
        resetStep = {() => {dispatch(clearError(stepId))}}
      />
      { (
        isStep(stepId, Step.NotSet, step) ||
        isStep(stepId, Step.Ok, step) ||
        isStep(stepId, Step.Error, step)
      ) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {createContract(
          dispatch,
          props.transactionManager,
          props.setContract
        )}}>
          Create new game contract on {network?.name}
        </Button>
        </SpaceWidget>
      }
      { (
        isStep(stepId, Step.Ok, step)
      ) &&
        <>
        <SpaceWidget>
        <Button variant="warning" onClick={() => {updateContractGameFactory()}}>
          Update game factory contract
        </Button>
        </SpaceWidget>
        <SpaceWidget>
        <Button variant="warning" onClick={() => {updateContractTrading()}}>
          Update contract trading
        </Button>
        </SpaceWidget>
        </>
      }
      { isStep(stepId, Step.Empty, step) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {props.contract && fillContract(
          dispatch,
          props.transactionManager,
          props.contract,
        )}}>
          Fill new game contract on {network?.name}
        </Button>
        </SpaceWidget>
      }
      <SpaceWidget>
      <Button variant="warning" onClick={() => {
        props.setContract(undefined)
        clearState(dispatch)
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

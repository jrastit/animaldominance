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
  createWithManagerContractPlayGameFactory,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  updateStep,
  setMessage,
  setError,
  clearError,
  getStep,
  StepId,
  Step,
  isStep,
  resetAllStep,
  resetAllSubStep,
} from '../reducer/contractSlice'

import {
  clearCardList
} from '../reducer/cardListSlice'

import {
  clearUser,
  clearUserDeckList,
  clearUserCardList
} from '../reducer/userSlice'

import {
  clearGameList,
  clearGame
} from '../reducer/gameSlice'

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

  const clearState = () => {
    dispatch(clearCardList())
    dispatch(clearUser())
    dispatch(clearUserDeckList())
    dispatch(clearUserCardList())
    dispatch(clearGame())
    dispatch(clearGameList())
  }

  const _setMessage = (message : string | undefined) => {
    dispatch(setMessage({id : stepId, message : message}))
  }

  const fillContract = (contract : ethers.Contract) => {
    _setMessage("Adding all cards...")
    dispatch(updateStep({id: stepId, step: Step.Creating}))
    createAllCard(contract, props.transactionManager, _setMessage).then(() => {
      dispatch(updateStep({id: stepId, step: Step.Ok}))
    }).catch((err) => {
      dispatch(setError({id : stepId, catchError : err}))
    })
  }

  const updateContractGameFactory = () => {
    if (props.contract){
      dispatch(updateStep({id: stepId, step: Step.Creating}))
      createWithManagerContractPlayGameFactory(props.transactionManager).then(
        async (contractFactory) => {
          if (props.contract){
            try {
              props.contract.updatePlayGameFactory(contractFactory.address)
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

  const createContract = () => {
    dispatch(updateStep({id: stepId, step: Step.Creating}))
    _setMessage("Creating contract game factory...")
    createWithManagerContractPlayGameFactory(props.transactionManager).then(async (contractFactory) => {
      _setMessage("Creating contract card admin...")
      createWithManagerContractCardAdmin(contractFactory, props.transactionManager).then(async (contract) => {
        props.setContract(contract)
        clearState()
        dispatch(resetAllSubStep())
        fillContract(contract)
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
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
        resetStep = {() => {dispatch(clearError(stepId))}}
      />
      { (
        isStep(stepId, Step.NotSet, step) ||
        isStep(stepId, Step.Ok, step) ||
        isStep(stepId, Step.Error, step)
      ) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {createContract()}}>
          Create new game contract on {props.networkName}
        </Button>
        </SpaceWidget>
      }
      { (
        isStep(stepId, Step.Ok, step)
      ) &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => {updateContractGameFactory()}}>
          Update game factory contract
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
        clearState()
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

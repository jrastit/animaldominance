import { ContractGameManager } from '../../contract/solidity/compiled/contractAutoFactory'
import { TransactionManager } from '../../util/TransactionManager'

import {
  updateStep,
  setMessage,
  setError,
  StepId,
  Step,
  resetAllSubStep,
} from '../../reducer/contractSlice'

import {
  createAllCard,
  registerTrading,
} from '../../game/card'

import {
  createContract as _createContract,
} from '../../game/contract'

import {
  clearCardList
} from '../../reducer/cardListSlice'

import {
  clearUser,
  clearUserDeckList,
  clearUserCardList
} from '../../reducer/userSlice'

import {
  clearGameList,
  clearGame
} from '../../reducer/gameSlice'

const stepId = StepId.Contract

export const clearState = (
  dispatch: any,
) => {
  dispatch(clearCardList())
  dispatch(clearUser())
  dispatch(clearUserDeckList())
  dispatch(clearUserCardList())
  dispatch(clearGame())
  dispatch(clearGameList())
}

export const fillContract = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }
  _setMessage("Adding all cards...")
  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  createAllCard(contract, _setMessage).then(() => {
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const createContract = (
  dispatch: any,
  transactionManager: TransactionManager,
  setContract: (contract: ContractGameManager | undefined) => void,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }

  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  _createContract(undefined, transactionManager, _setMessage).then(async (contract) => {
    _setMessage("Creating contract trading...")
    registerTrading(contract).then(() => {
      setContract(contract)
      console.log('New game contract', contract.address)
      clearState(dispatch)
      dispatch(resetAllSubStep())
      fillContract(dispatch, contract)
    }).catch((err) => {
      dispatch(setError({ id: stepId, catchError: err }))
    })
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

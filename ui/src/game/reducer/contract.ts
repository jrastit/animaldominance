import * as ethers from 'ethers'
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
  createWithManagerContractCardAdmin,
  createWithManagerContractPlayGameFactory,
} from '../../contract/solidity/compiled/contractAutoFactory'


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
  transactionManager: TransactionManager,
  contract: ethers.Contract,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }
  _setMessage("Adding all cards...")
  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  createAllCard(contract, transactionManager, _setMessage).then(() => {
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const createContract = (
  dispatch: any,
  transactionManager: TransactionManager,
  setContract: (contract: ethers.Contract | undefined) => void,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }

  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  _setMessage("Creating contract game factory...")
  createWithManagerContractPlayGameFactory(transactionManager).then(async (contractFactory) => {
    _setMessage("Creating contract card admin...")
    createWithManagerContractCardAdmin(contractFactory, transactionManager).then(async (contract) => {
      _setMessage("Creating trading contract...")
      registerTrading(contract, transactionManager).then(() => {
        setContract(contract)
        console.log('New game contract', contract.address)
        clearState(dispatch)
        dispatch(resetAllSubStep())
        fillContract(dispatch, transactionManager, contract)
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    }).catch((err) => {
      dispatch(setError({ id: stepId, catchError: err }))
    })
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

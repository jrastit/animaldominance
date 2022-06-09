import { useEffect } from 'react'

import {
  Step,
  StepId,
  isInit,
  isOk,
  updateStep,
  resetAllStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  loadContract,
  loadCardList,
  _loadAllTread,
  loadUser,
  loadGameList,
  loadUserCardList,
  loadUserDeckList,
} from '../game/reducer/contract'

import {
  ContractHandlerType
} from '../type/contractType'

const ContractLoader = (props: {
  contractHandler: ContractHandlerType,
}) => {
  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const user = useAppSelector((state) => state.userSlice.user)
  const network = useAppSelector((state) => state.walletSlice.network)
  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isInit(StepId.Contract, step) && isOk(StepId.Wallet, step) && network) {
      loadContract(
        dispatch,
        props.contractHandler,
        network,
      )
    }
    if (isOk(StepId.Contract, step) && props.contractHandler.gameManager.contract) {
      if (isInit(StepId.CardList, step)) {
        loadCardList(
          dispatch,
          props.contractHandler.gameManager.contract,
        )
      }
      if (isInit(StepId.Trading, step) && props.contractHandler.trading.contract) {
        _loadAllTread(
          dispatch,
          props.contractHandler.gameManager.contract,
          props.contractHandler.trading.contract,
        )
      }
      if (isInit(StepId.User, step)) {
        loadUser(
          dispatch,
          props.contractHandler.gameManager.contract,
        )
      }
      if (isOk(StepId.User, step) && isInit(StepId.GameList, step)) {
        loadGameList(
          dispatch,
          props.contractHandler.gameManager.contract,
        )
      }
      if (user) {
        if (isOk(StepId.User, step) && isInit(StepId.UserCardList, step)) {
          loadUserCardList(
            dispatch,
            props.contractHandler.gameManager.contract,
            user
          )
        }
        if (isOk(StepId.User, step) && isInit(StepId.UserDeckList, step)) {
          loadUserDeckList(
            dispatch,
            props.contractHandler.gameManager.contract,
            user
          )
        }
        if (isOk(StepId.User, step) && isInit(StepId.Game, step) && user.gameId) {
          dispatch(updateStep({ id: StepId.Game, step: Step.Clean }))
        }
      }
    } else {
      if (isOk(StepId.Contract, step)) {
        dispatch(resetAllStep())
      }
    }
  }, [
      dispatch,
      user,
      step,
      network,
      version,
      wallet,
      props.contractHandler,
    ])

  return (
    <>
    </>
  )
}

export default ContractLoader

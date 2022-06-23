import { useEffect } from 'react'

import {
  StepId,
  isInit,
  isOk,
  resetAllStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  loadNFT,
} from '../game/reducer/nft'

import {
  loadContract,
  loadCardList,
  _loadAllTread,
  loadUser,
  loadGameList,
  loadGameId,
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
    if (isOk(StepId.Contract, step)) {
      if (isInit(StepId.CardList, step)) {
        loadCardList(
          dispatch,
          props.contractHandler,
        )
      }
      if (isInit(StepId.Trading, step)) {
        _loadAllTread(
          dispatch,
          props.contractHandler,
        )
      }
      if (isInit(StepId.Nft, step)) {
        loadNFT(
          dispatch,
          props.contractHandler,
        )
      }
      if (isInit(StepId.User, step)) {
        loadUser(
          dispatch,
          props.contractHandler,
        )
      }
      if (isOk(StepId.User, step) && isInit(StepId.GameList, step)) {
        loadGameList(
          dispatch,
          props.contractHandler,
        )
      }
      if (user) {
        if (isOk(StepId.User, step) && isInit(StepId.Game, step)) {
          loadGameId(
            user.id,
            dispatch,
            props.contractHandler,
          )
        }
        if (isOk(StepId.User, step) && isInit(StepId.UserCardList, step)) {
          loadUserCardList(
            dispatch,
            props.contractHandler,
            user
          )
        }
        if (isOk(StepId.User, step) && isInit(StepId.UserDeckList, step)) {
          loadUserDeckList(
            dispatch,
            props.contractHandler,
            user
          )
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

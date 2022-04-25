import * as ethers from 'ethers'
import { useEffect } from 'react'
import { TransactionManager } from '../util/TransactionManager'
import { getNetworkList } from '../util/networkInfo'

import {
  getContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  Step,
  StepId,
  isInit,
  isOk,
  updateStep,
  setError,
  setMessage,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  getUserId,
  getUser,
  getUserCardList,
  getUserDeckList,
} from '../game/user'

import {
  setUser,
  setUserCardList,
  setUserDeckList
} from '../reducer/userSlice'

import {
  getCardId,
  loadAllCard,
} from '../game/card'

import {
  getGameList,
} from '../game/game'

import { setCardList } from '../reducer/cardListSlice'
import {
  addGameList,
  fillGameList,
  setGameList
} from '../reducer/gameSlice'


const ContractLoader = (props : {
  transactionManager : TransactionManager,
  contract ?: ethers.Contract,
  setContract : (contract : ethers.Contract) => void,
  networkName : string,
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const setMessageCardList = (message : string | undefined) => {
    dispatch(setMessage({ id : StepId.CardList, message : message}))
  }

  const loadUser = () => {
    const stepId = StepId.User
    if (props.contract){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      getUserId(props.contract).then((userId) => {
        if (userId && props.contract){
          getUser(props.contract, userId).then((user) => {
            dispatch(setUser(user))
              dispatch(updateStep({id : stepId, step: Step.Ok}))
          }).catch((err) => {
            dispatch(setError({id : stepId, catchError: err}))
          })
        } else if (props.contract){
          dispatch(updateStep({id : stepId, step: Step.NotSet}))
        }
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }
  }

  const loadUserCardList = () => {
    const stepId = StepId.UserCardList
    if (props.contract && user){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      getUserCardList(props.contract, user.id).then((_userCardList) => {
        if (_userCardList.length > 0){
          dispatch(setUserCardList(_userCardList))
          dispatch(updateStep({id : stepId, step: Step.Ok}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Empty}))
        }
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }
  }

  const loadUserDeckList = () => {
    const stepId = StepId.UserDeckList
    if (props.contract && user){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      getUserDeckList(props.contract, user.id).then((_userDeckList) => {
        if (_userDeckList.length > 0){
          dispatch(setUserDeckList(_userDeckList))
          dispatch(updateStep({id : stepId, step: Step.Ok}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Empty}))
        }
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }
  }

  const loadCardList = () => {
    const stepId = StepId.CardList
    if (props.contract){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      loadAllCard(props.contract, setMessageCardList).then((_cardList) => {
        if (_cardList.length > 0){
          dispatch(setCardList(_cardList))
          dispatch(updateStep({id : stepId, step: Step.Ok}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Empty}))
        }
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }
  }

  const loadGameList = () => {
    const stepId = StepId.GameList
    if (props.contract){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      try {
        addGameListener()
      } catch (err : any) {
        dispatch(setError({id : stepId, catchError: err}))
        return
      }
      getGameList(props.contract).then((_gameList) => {
        dispatch(setGameList(_gameList))
        dispatch(updateStep({id : stepId, step: Step.Ok}))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError: err}))
      })
    }
  }

  const addGameListener = () => {
    if (props.contract){
      if (props.contract.listenerCount("GameCreated") === 0) {
        props.contract.on("GameCreated", (id, userId) => {
          dispatch(addGameList({
            id : id.toNumber(),
            userId1 : userId.toNumber(),
            userId2 : 0,
            userDeck1 : 0,
            userDeck2 : 0
          }))
        })
      }
      if (props.contract.listenerCount("GameFill") === 0) {
        props.contract.on("GameFill", (id, userId) => {
          dispatch(fillGameList({
            id : id.toNumber(),
            userId : userId.toNumber(),
          }))
        })
      }
    }
  }

  const loadContract = (networkName : string) => {
    const stepId = StepId.Contract
    dispatch(updateStep({id : stepId, step: Step.Loading}))
    getNetworkList().then(async (networkList) => {
      const network = networkList.filter(
        (network) => network.name === networkName
      )[0]
      if (network.gameContract){
        const _contract = getContractCardAdmin(
          network.gameContract,
          props.transactionManager.signer
        )
        try {
          //check if contract is working
          if (await getCardId(_contract) > 0){
            props.setContract(_contract)
            dispatch(updateStep({id : stepId, step: Step.Ok}))
          } else {
            dispatch(updateStep({id : stepId, step: Step.Empty}))
          }
        }
        catch(err : any) {
          dispatch(setError({id : stepId, error: "Contract error"}))
        }
      } else {
        //no game contract set
        dispatch(updateStep({id : stepId, step: Step.NotSet}))
      }
    }).catch(() => {
      dispatch(setError({id : stepId, error: "network config error"}))
    })
  }

  useEffect(() => {
    if (isInit(StepId.Contract, step) && props.networkName){
      loadContract(props.networkName)
    }
    if (isOk(StepId.Contract, step) && isInit(StepId.CardList, step)){
      loadCardList()
    }
    if (isOk(StepId.Contract, step) && isInit(StepId.User, step)){
      loadUser()
    }
    if (isOk(StepId.User, step) && isInit(StepId.UserCardList, step)){
      loadUserCardList()
    }
    if (isOk(StepId.User, step) && isInit(StepId.UserDeckList, step)){
      loadUserDeckList()
    }
    if (isOk(StepId.Contract, step) && isInit(StepId.GameList, step)){
      loadGameList()
    }
  }, [
    step,
    version,
    props,
    props.networkName,
  ])

  return (
    <>
    </>
  )
}

export default ContractLoader

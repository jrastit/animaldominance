import * as ethers from 'ethers'
import { useEffect } from 'react'
import { TransactionManager } from '../util/TransactionManager'
import { getNetworkList } from '../util/networkInfo'

import {
  getContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  UserType
} from '../type/userType'

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
  setUserDeckList,
  setGameId,
  endGameId,
} from '../reducer/userSlice'

import {
  getCardLastId,
  loadAllCard,
} from '../game/card'

import {
  getGameList,
} from '../game/game'

import { setCardList } from '../reducer/cardListSlice'
import {
  addGameList,
  fillGameList,
  endGameList,
  setGameList
} from '../reducer/gameSlice'


const loadUser = (
  dispatch: any,
  contract: ethers.Contract,
) => {
  const stepId = StepId.User
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserId(contract).then((userId) => {
    if (userId && contract) {
      getUser(contract, userId).then((_user) => {
        dispatch(setUser(_user))
        dispatch(updateStep({ id: stepId, step: Step.Ok }))
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    } else if (contract) {
      dispatch(updateStep({ id: stepId, step: Step.NotSet }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const loadUserCardList = (
  dispatch: any,
  contract: ethers.Contract,
  user: UserType,
) => {
  const stepId = StepId.UserCardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserCardList(contract, user.id).then((_userCardList) => {
    if (_userCardList.length > 0) {
      dispatch(setUserCardList(_userCardList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const loadUserDeckList = (
  dispatch: any,
  contract: ethers.Contract,
  user: UserType,
) => {
  const stepId = StepId.UserDeckList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserDeckList(contract, user.id).then((_userDeckList) => {
    if (_userDeckList.length > 0) {
      dispatch(setUserDeckList(_userDeckList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const loadCardList = (
  dispatch: any,
  contract: ethers.Contract,
) => {
  const stepId = StepId.CardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  const setMessageCardList = (message: string | undefined) => {
    dispatch(setMessage({ id: StepId.CardList, message: message }))
  }
  loadAllCard(contract, setMessageCardList).then((_cardList) => {
    if (_cardList.length > 0) {
      dispatch(setCardList(_cardList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const loadGameList = (
  dispatch: any,
  contract: ethers.Contract,
  user: UserType,
) => {
  const stepId = StepId.GameList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  try {
    addGameListener(dispatch, contract, user)
  } catch (err: any) {
    dispatch(setError({ id: stepId, catchError: err }))
    return
  }
  getGameList(contract).then((_gameList) => {
    dispatch(setGameList(_gameList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const addGameListener = (
  dispatch: any,
  contract: ethers.Contract,
  user: UserType,
) => {
  if (contract.listenerCount("GameCreated") === 0) {
    contract.on("GameCreated", (_chainGameId, _chainUserId) => {
      const _gameId = _chainGameId.toNumber()
      const _userId = _chainUserId.toNumber()
      console.log("game created event ", _gameId, _userId)
      dispatch(addGameList({
        id: _gameId,
        userId1: _userId,
        userId2: 0,
        userDeck1: 0,
        userDeck2: 0,
        winner: 0,
      }))
      if (user && user.id === _userId) {
        console.log("setGame created")
        dispatch(setGameId(_gameId))
        dispatch(updateStep({ id: StepId.Game, step: Step.Waiting }))
      }
    })
  }
  if (contract.listenerCount("GameFill") === 0) {
    contract.on("GameFill", (_chainGameId, _chainUserId) => {
      const _gameId = _chainGameId.toNumber()
      const _userId = _chainUserId.toNumber()
      console.log("game join event", _gameId, _userId)
      dispatch(fillGameList({
        id: _gameId,
        userId: _userId,
      }))
      if (user && user.id === _userId) {
        console.log("setGame join", _gameId)
        dispatch(setGameId(_gameId))
      }
    })
  }
  if (contract.listenerCount("GameEnd") === 0) {
    contract.on("GameEnd", (_chainGameId, _chainWinner) => {
      const _gameId = _chainGameId.toNumber()
      const _winner = _chainWinner.toNumber()
      console.log("game end event", _gameId, _winner)
      dispatch(endGameList({
        id: _gameId,
        winner: _winner,
      }))
      dispatch(endGameId(_gameId))
    })
  }
}

const loadContract = (
  dispatch: any,
  transactionManager: TransactionManager,
  setContract: (contract: ethers.Contract) => void,
  networkName: string
) => {
  const stepId = StepId.Contract
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getNetworkList().then(async (networkList) => {
    const network = networkList.filter(
      (network) => network.name === networkName
    )[0]
    if (network.gameContract) {
      const _contract = getContractCardAdmin(
        network.gameContract,
        transactionManager.signer
      )
      try {
        //check if contract is working
        if (await getCardLastId(_contract) > 0) {
          setContract(_contract)
          dispatch(updateStep({ id: stepId, step: Step.Ok }))
        } else {
          dispatch(updateStep({ id: stepId, step: Step.Empty }))
        }
      }
      catch (err: any) {
        dispatch(setError({ id: stepId, error: "Contract error" }))
      }
    } else {
      //no game contract set
      dispatch(updateStep({ id: stepId, step: Step.NotSet }))
    }
  }).catch(() => {
    dispatch(setError({ id: stepId, error: "network config error" }))
  })
}

const ContractLoader = (props: {
  transactionManager: TransactionManager,
  contract?: ethers.Contract,
  setContract: (contract: ethers.Contract) => void,
  networkName: string,
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()



  useEffect(() => {
    if (isInit(StepId.Contract, step) && props.networkName) {
      loadContract(
        dispatch,
        props.transactionManager,
        props.setContract,
        props.networkName,
      )
    }
    if (props.contract) {
      if (isOk(StepId.Contract, step) && isInit(StepId.CardList, step)) {
        loadCardList(
          dispatch,
          props.contract,
        )
      }
      if (isOk(StepId.Contract, step) && isInit(StepId.User, step)) {
        loadUser(dispatch, props.contract)
      }
      if (user) {
        if (isOk(StepId.User, step) && isInit(StepId.UserCardList, step)) {
          loadUserCardList(dispatch, props.contract, user)
        }
        if (isOk(StepId.User, step) && isInit(StepId.UserDeckList, step)) {
          loadUserDeckList(dispatch, props.contract, user)
        }
        if (isOk(StepId.User, step) && isInit(StepId.GameList, step)) {
          loadGameList(dispatch, props.contract, user)
        }
        if (isOk(StepId.User, step) && isInit(StepId.Game, step) && user.gameId) {
          dispatch(updateStep({ id: StepId.Game, step: Step.Clean }))
        }
      }
    }
  }, [
      dispatch,
      user,
      step,
      version,
      props.setContract,
      props.transactionManager,
      props.contract,
      props.networkName,
    ])

  return (
    <>
    </>
  )
}

export default ContractLoader

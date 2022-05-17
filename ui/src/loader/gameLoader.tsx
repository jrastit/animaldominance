import * as ethers from 'ethers'
import { useEffect } from 'react'
import { TransactionManager } from '../util/TransactionManager'

import { UserType } from '../type/userType'

import {
  Step,
  StepId,
  isStep,
  isOk,
  updateStep,
  setError,
  setMessage,
} from '../reducer/contractSlice'

import {
  getGameContract,
  getGameFull
} from '../game/game'

import {
  getUser,
} from '../game/user'

import {
  setGame,
  setOponent,
  cleanGame,
  setGameVersion,
  addPlayAction,
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const stepId = StepId.Game

const addGameListener = (dispatch : any, _gameContract : ethers.Contract) => {
  if (_gameContract){
    if (_gameContract.listenerCount("PlayAction") === 0) {
      _gameContract.on("PlayAction", (turn : number, actionId : number, gameCardId : number, dest : number, result : number) => {
        console.log("Play action event " + turn + ' ,' + actionId + ', ' + gameCardId + ', ' + dest + ', ' + result)
        dispatch(addPlayAction({turn, actionId, data : [gameCardId, dest, result]}))
      })
    }
    if (_gameContract.listenerCount("GameUpdate") === 0) {
      _gameContract.on("GameUpdate", (_gameVersion : number) => {
        console.log("game update event " + _gameVersion)
        dispatch(setGameVersion(_gameVersion))
      })
    }
  }
}

const _cleanGame = (dispatch : any) => {
  dispatch(updateStep({id : stepId, step: Step.Loading}))
  dispatch(cleanGame())
  setTimeout(() => dispatch(updateStep({id : stepId, step: Step.Clean})), 100)
}

const _getGameFull = (
  dispatch : any,
  contract : ethers.Contract,
  gameContract : ethers.Contract,
  user : UserType | undefined,
  oponent : UserType | undefined,
  _setMessage ?: (message : string) => void,
) => {
  if (user){
    getGameFull(gameContract, _setMessage).then((_game) => {
      dispatch(setGame(_game))
      if (!oponent){
        let oponentId =  user.id === _game.userId1?_game.userId2:_game.userId1
        if (!oponent) {
          oponentId = user.id
        }
        getUser(contract, oponentId).then(
          (_oponent) => {
            dispatch(setOponent(_oponent))
            if (_game.ended){
              dispatch(updateStep({id : stepId, step: Step.Ended}))
            } else {
              dispatch(updateStep({id : stepId, step: Step.Running}))
            }
          }
        )
      } else {
        if (_game.ended){
          dispatch(updateStep({id : stepId, step: Step.Ended}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Running}))
        }
      }

    }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
  } else {
    dispatch(setError({id:stepId, error:"user not set"}))
  }

}

const loadGameFromId = (
  dispatch : any,
  contract : ethers.Contract,
  transactionManager : TransactionManager,
  user : UserType | undefined,
  setGameContract : (contract : ethers.Contract) => void,
  oponent : UserType | undefined,
) => {
  if (user && user.gameId){
    dispatch(updateStep({id : stepId, step: Step.Loading}))
    getGameContract(contract, transactionManager, user.gameId).then((_gameContract) => {
      if (_gameContract){
        addGameListener(dispatch, _gameContract)
        setGameContract(_gameContract)
        const _setMessage = (message : string) => {
          dispatch(setMessage({id : stepId, message : message}))
        }
        _getGameFull(
          dispatch,
          contract,
          _gameContract,
          user,
          oponent,
           _setMessage,
        )
      } else {
        dispatch(updateStep({id : stepId, step: Step.Waiting}))
      }
    }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
  } else {
    dispatch(setError({id:stepId, error:"user gameId not set"}))
  }
}

const updateGame = (
  dispatch : any,
  contract : ethers.Contract,
  gameContract : ethers.Contract | undefined,
  user : UserType | undefined,
  oponent : UserType | undefined,
) => {
  if (gameContract){
    dispatch(updateStep({id : stepId, step: Step.Refresh}))
    _getGameFull(
      dispatch,
      contract,
      gameContract,
      user,
      oponent,
    )
  }
}

const GameLoader = (props : {
  transactionManager : TransactionManager,
  contract : ethers.Contract,
  gameContract ?: ethers.Contract,
  setGameContract : (contract : ethers.Contract) => void,
}) => {
  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const gameVersion = useAppSelector((state) => state.gameSlice.gameVersion)
  const game = useAppSelector((state) => state.gameSlice.game)
  const user = useAppSelector((state) => state.userSlice.user)
  const oponent = useAppSelector((state) => state.gameSlice.oponent)
  const network = useAppSelector((state) => state.walletSlice.network)
  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const dispatch = useAppDispatch()

  useEffect(() => {

    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Ready, step)){
      _cleanGame(dispatch)
    }

    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Clean, step) && user && user.gameId){
      loadGameFromId(
        dispatch,
        props.contract,
        props.transactionManager,
        user,
        props.setGameContract,
        oponent,
      )
    }
    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Running, step)){
      if (game && game.version < gameVersion){
        updateGame(
          dispatch,
          props.contract,
          props.gameContract,
          user,
          oponent,
        )
      }
    }
  }, [
    dispatch,
    oponent,
    user,
    game,
    step,
    version,
    props,
    gameVersion,
    network,
    wallet,
  ])

  return (
    <>
    </>
  )
}

export default GameLoader

import * as ethers from 'ethers'
import { useEffect } from 'react'
import { TransactionManager } from '../util/TransactionManager'

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
  setGame,
  clearGame,
  setGameVersion,
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const GameLoader = (props : {
  transactionManager : TransactionManager,
  contract : ethers.Contract,
  gameContract ?: ethers.Contract,
  setGameContract : (contract : ethers.Contract) => void,
}) => {
  const stepId = StepId.Game
  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const gameId = useAppSelector((state) => state.gameSlice.gameId)
  const gameVersion = useAppSelector((state) => state.gameSlice.gameVersion)
  const game = useAppSelector((state) => state.gameSlice.game)
  const dispatch = useAppDispatch()

  const _setMessage = (message : string) => {
    dispatch(setMessage({id : stepId, message : message}))
  }

  const loadGameFromId = () => {
    dispatch(clearGame())
    dispatch(updateStep({id : stepId, step: Step.Loading}))
    getGameContract(props.contract, props.transactionManager, gameId).then((_gameContract) => {
      addGameListener(_gameContract)
      getGameFull(_gameContract, _setMessage).then((_game) => {
        props.setGameContract(_gameContract)
        dispatch(setGame(_game))
        if (_game.winner){
          dispatch(updateStep({id : stepId, step: Step.Ended}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Running}))
        }
      }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
  }

  const addGameListener = (_gameContract : ethers.Contract) => {
    if (_gameContract){
      if (_gameContract.listenerCount("GameUpdate") === 0) {
        _gameContract.on("GameUpdate", (_gameVersion : number) => {
          console.log("game update event " + _gameVersion)
          dispatch(setGameVersion(_gameVersion))
        })
      }
    }
  }

  const updateGame = () => {
    if (props.gameContract){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      getGameFull(props.gameContract, _setMessage).then((_game) => {
        dispatch(setGame(_game))
        if (_game.winner){
          dispatch(updateStep({id : stepId, step: Step.Ended}))
        } else {
          dispatch(updateStep({id : stepId, step: Step.Running}))
        }
      }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }
  }

  useEffect(() => {
    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Ready, step)){
      loadGameFromId()
    }
    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Running, step)){
      if (game && game.version < gameVersion){
        updateGame()
      }
    }
  }, [
    step,
    version,
    props,
    gameVersion,
  ])

  return (
    <>
    </>
  )
}

export default GameLoader

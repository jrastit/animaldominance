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
  getUser,
} from '../game/user'

import {
  setGame,
  setOponent,
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
  const user = useAppSelector((state) => state.userSlice.user)
  const oponent = useAppSelector((state) => state.gameSlice.oponent)
  const dispatch = useAppDispatch()

  const _setMessage = (message : string) => {
    dispatch(setMessage({id : stepId, message : message}))
  }

  const _getGameFull = (_gameContract : ethers.Contract) => {
    if (user){
      getGameFull(_gameContract, _setMessage).then((_game) => {
        dispatch(setGame(_game))
        if (!oponent){
          getUser(props.contract, user.id === _game.userId1?_game.userId2:_game.userId1).then(
            (_oponent) => {
              console.log("oponent ", _oponent)
              dispatch(setOponent(_oponent))
              if (_game.winner){
                dispatch(updateStep({id : stepId, step: Step.Ended}))
              } else {
                dispatch(updateStep({id : stepId, step: Step.Running}))
              }
            }
          )
        } else {
          console.log("oponent already set ", oponent)
          if (_game.winner){
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

  const loadGameFromId = () => {
    dispatch(clearGame())
    dispatch(updateStep({id : stepId, step: Step.Loading}))
    getGameContract(props.contract, props.transactionManager, gameId).then((_gameContract) => {
      addGameListener(_gameContract)
      props.setGameContract(_gameContract)
      _getGameFull(_gameContract)
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
      if (_gameContract.listenerCount("PlayAction") === 0) {
        _gameContract.on("PlayAction", (id : number, gameCard : number, dest : number, result : number) => {
          console.log("Play action event " + id + ', ' + gameCard + ', ' + dest + ', ' + result)
        })
      }
    }
  }

  const updateGame = () => {
    if (props.gameContract){
      dispatch(updateStep({id : stepId, step: Step.Loading}))
      _getGameFull(props.gameContract)
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

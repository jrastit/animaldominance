import { useEffect } from 'react'
import {
  ContractHandlerType
} from '../type/contractType'

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

const addGameListener = (dispatch : any, contractHandler: ContractHandlerType,) => {

    if (contractHandler.playGame.getContract().listenerCount("PlayAction") === 0) {
      contractHandler.playGame.getContract().on("PlayAction", (turn : number, id : number, gameCardId : number, actionTypeId : number, dest : number, result : number) => {
        console.log("Play action event " + turn + ' ,' + id + ', ' + gameCardId + ', ' + actionTypeId + ', ' + dest + ', ' + result)
        dispatch(addPlayAction({turn, id, gameAction : {gameCardId, actionTypeId, dest, result}}))
      })
    }
    if (contractHandler.playGame.getContract().listenerCount("GameUpdate") === 0) {
      contractHandler.playGame.getContract().on("GameUpdate", (_gameVersion : number) => {
        console.log("game update event " + _gameVersion)
        dispatch(setGameVersion(_gameVersion))
      })
    }
}

const _cleanGame = (dispatch : any) => {
  dispatch(updateStep({id : stepId, step: Step.Loading}))
  dispatch(cleanGame())
  setTimeout(() => dispatch(updateStep({id : stepId, step: Step.Clean})), 100)
}

const _getGameFull = (
  dispatch : any,
  contractHandler: ContractHandlerType,
  user : UserType | undefined,
  oponent : UserType | undefined,
  _setMessage ?: (message : string) => void,
) => {
  if (user){
    getGameFull(contractHandler, _setMessage).then((_game) => {
      dispatch(setGame(_game))
      if (!oponent){
        let oponentId =  user.id === _game.userId1?_game.userId2:_game.userId1
        if (!oponent) {
          oponentId = user.id
        }
        getUser(contractHandler, oponentId).then(
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
  contractHandler: ContractHandlerType,
  user : UserType | undefined,
  gameId : number,
  oponent : UserType | undefined,
) => {
  if (user && gameId){
    dispatch(updateStep({id : stepId, step: Step.Loading}))
    getGameContract(contractHandler, gameId).then(() => {
        addGameListener(dispatch, contractHandler)
        const _setMessage = (message : string) => {
          dispatch(setMessage({id : stepId, message : message}))
        }
        _getGameFull(
          dispatch,
          contractHandler,
          user,
          oponent,
           _setMessage,
        )
    }).catch ((err) => {dispatch(setError({id:stepId, catchError:err}))})
  } else {
    dispatch(setError({id:stepId, error:"user gameId not set"}))
  }
}

const updateGame = (
  dispatch : any,
  contractHandler: ContractHandlerType,
  user : UserType | undefined,
  oponent : UserType | undefined,
) => {
    dispatch(updateStep({id : stepId, step: Step.Refresh}))
    _getGameFull(
      dispatch,
      contractHandler,
      user,
      oponent,
    )
}

const GameLoader = (props : {
  contractHandler: ContractHandlerType,
}) => {
  const step = useAppSelector((state) => state.contractSlice.step)
  const version = useAppSelector((state) => state.contractSlice.version)
  const gameVersion = useAppSelector((state) => state.gameSlice.gameVersion)
  const gameId = useAppSelector((state) => state.gameSlice.gameId)
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

    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Clean, step) && gameId){
      loadGameFromId(
        dispatch,
        props.contractHandler,
        user,
        gameId,
        oponent,
      )
    }
    if (isOk(StepId.Contract, step) && isStep(stepId, Step.Running, step)){
      if (game && game.version < gameVersion){
        updateGame(
          dispatch,
          props.contractHandler,
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
    gameId,
  ])

  return (
    <>
    </>
  )
}

export default GameLoader

import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import DivNice from '../../component/divNice'
import { ContractHandlerType } from '../../type/contractType'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  cancelGame,
} from '../../game/gameList'

import {
  Step,
  StepId,
  updateStep,
  setError,
} from '../../reducer/contractSlice'

import {
  clearGame,
} from '../../reducer/gameSlice'

const stepId = StepId.Game

const GameWaitingWidget = (props:{
  contractHandler : ContractHandlerType,
}) => {

  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const gameId = useAppSelector((state) => state.gameSlice.gameId)
  const dispatch = useAppDispatch()

  console.log(gameList.filter(_gameItem => _gameItem.id === gameId)[0])

  useEffect(() => {
      const gameItem = gameList.filter(_gameItem => _gameItem.id === gameId)[0]
      if (gameItem) {
        if (gameItem.ended){
          dispatch(updateStep({id : stepId, step : Step.Ended}))
        } else if (gameItem.userId2){
          dispatch(updateStep({id : stepId, step : Step.Ready}))
        }
      }
  }, [gameList, dispatch, gameId])

  const _cancelGame = () => {
    dispatch(updateStep({id : stepId, step : Step.Loading}))
    cancelGame(props.contractHandler).then(() => {
      dispatch(clearGame())
      dispatch(updateStep({id : stepId, step : Step.Init}))
    }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
  }

  return (
    <DivNice>
    Waiting for opponent for game {gameId}<br/><br/>
    <Button variant='danger' onClick={_cancelGame}>Cancel</Button>
    </DivNice>
  )
}

export default GameWaitingWidget

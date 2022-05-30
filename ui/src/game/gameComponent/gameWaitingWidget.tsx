import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import DivNice from '../../component/divNice'
import { ContractCardAdmin } from '../../contract/solidity/compiled/contractAutoFactory'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  setGameId
} from '../../reducer/userSlice'

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
  contract : ContractCardAdmin,
}) => {

  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  console.log(user && gameList.filter(_gameItem => _gameItem.id === user.gameId)[0])

  useEffect(() => {
    if (user){
      const gameItem = gameList.filter(_gameItem => _gameItem.id === user.gameId)[0]
      if (gameItem) {
        if (gameItem.ended){
          dispatch(updateStep({id : stepId, step : Step.Ended}))
        } else if (gameItem.userId2){
          dispatch(updateStep({id : stepId, step : Step.Ready}))
        }
      }
    }
  }, [gameList, dispatch, user])

  const _cancelGame = () => {
    dispatch(updateStep({id : stepId, step : Step.Loading}))
    cancelGame(props.contract).then(() => {
      dispatch(setGameId(0))
      dispatch(clearGame())
      dispatch(updateStep({id : stepId, step : Step.Init}))
    }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
  }

  return (
    <DivNice>
    Waiting for opponent for game {user?.gameId}<br/><br/>
    <Button variant='danger' onClick={_cancelGame}>Cancel</Button>
    </DivNice>
  )
}

export default GameWaitingWidget

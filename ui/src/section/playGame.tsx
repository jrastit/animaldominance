import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import DivNice from '../component/divNice'
import ButtonNice from '../component/buttonNice'
import GameLoader from './gameLoader'
import GameBoard from '../game/component/gameBoard'

import {
  Step,
  StepId,
  isStep,
  getStep,
  updateStep,
  clearError,
  setError,
} from '../reducer/contractSlice'

import {
  clearGame,
  addPlayAction,
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  endTurn,
  leaveGame,
  endGameByTime,
  cancelGame,
} from '../game/game'

import StepMessageWidget from '../component/stepMessageWidget'

const PlayGame = (props:{
  transactionManager : TransactionManager,
  contract : ethers.Contract,
}) => {

  const [gameContract, setGameContract] = useState<ethers.Contract>()

  const stepId = StepId.Game
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const game = useAppSelector((state) => state.gameSlice.game)
  const oponent = useAppSelector((state) => state.gameSlice.oponent)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const playActionList = useAppSelector((state) => state.gameSlice.playActionList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()


  if (isStep(stepId, Step.Waiting, step) && user && user.gameId) {
    const gameItem = gameList.filter(_gameItem => _gameItem.id === user.gameId)[0]
    if (gameItem) {
      if (gameItem.ended){
        setTimeout(() => {dispatch(updateStep({id : stepId, step : Step.Ended}))}, 100)
      } else if (gameItem.playGame){
        setTimeout(() => {dispatch(updateStep({id : stepId, step : Step.Ready}))}, 100)
      }
    }
  }

  const isWinner = () => {
    if (user && game){
      if (game.winner === user.id){
        return 1
      }
    }
    return 0
  }

  const _exitGame = () => {
    dispatch(clearGame())
    dispatch(clearError(stepId))
  }

  const _addPlayAction = (payload: {
    turn: number,
    actionId: number,
    data: number[]
  }) => {
    console.log(payload)
    dispatch(addPlayAction(payload))
  }

  const _playTurn = (playActionList : number[][], turn : number) => {
    if (gameContract){
      endTurn(
        gameContract,
        props.transactionManager,
        playActionList,
        turn,
        [],
        _addPlayAction
      ).then(() => {

      }).catch((err) => {
        console.log(err)
        dispatch(setError({id:stepId, catchError:err}))
      })
    }
  }

  const _leaveGame = () => {
    if (gameContract){
      leaveGame(gameContract, props.transactionManager).then(() => {

      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }

  }

  const _endGameByTime = () => {
    if (gameContract){
      endGameByTime(gameContract, props.transactionManager).then(() => {
      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }
  }

  const _cancelGame = () => {
    cancelGame(props.contract, props.transactionManager).then(() => {
    }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
  }

  const render = () => {
    if (isStep(stepId, Step.Waiting, step)){
      return (
        <DivNice>
        Waiting for opponent for game {user?.gameId}<br/><br/>
        <Button variant='danger' onClick={_cancelGame}>Cancel</Button>
        </DivNice>
      )
    } else if (isStep(stepId, Step.Loading, step)) {
      return (
        <DivNice>Loading</DivNice>
      )
    } else if (isStep(stepId, Step.Creating, step)) {
      return (
        <DivNice>Creating game</DivNice>
      )
    } else if (isStep(stepId, Step.Joining, step)) {
      return (
        <DivNice>Joining game</DivNice>
      )
    } else if (isStep(stepId, Step.Error, step)) {
      return (
        <DivNice>Error!!!</DivNice>
      )
    } else if (isStep(stepId, Step.Running, step) || isStep(stepId, Step.Refresh, step)){
      if (game && user && oponent){
        return (
          <GameBoard
            user={user}
            oponent={oponent}
            game={game}
            cardList={cardList}
            playActionList={playActionList}
            endGameByTime={_endGameByTime}
            endTurn={_playTurn}
          ><ButtonNice onClick={_leaveGame}>Leave game</ButtonNice>
          </GameBoard>
        )
      } else {
        if (!game) {
          return (
            <DivNice>Error game not set</DivNice>
          )
        }
        if (!user) {
          return (
            <DivNice>Error user not set</DivNice>
          )
        }
        if (!oponent) {
          return (
            <DivNice>Error oponent not set</DivNice>
          )
        }
      }
    } else if (isStep(stepId, Step.Ended, step)){
      return (
        <DivNice>
            {!!isWinner() && <div>You Win!!!</div>}
            {!isWinner() && <div>You Lose!!!</div>}
            <ButtonNice onClick={_exitGame}>Ok</ButtonNice>
        </DivNice>
      )
    } else {
      return (
        <DivNice>Unknow step</DivNice>
      )
    }
  }

  return (
    <>
    <StepMessageWidget
      step={getStep(stepId, step)}
      resetStep = {() => {dispatch(clearError(stepId))}}
    />
    <Row>
      <Col>
        <GameLoader
          contract={props.contract}
          transactionManager={props.transactionManager}
          setGameContract={setGameContract}
          gameContract={gameContract}
        />
      </Col>
    </Row>
    {render()}
    </>
  )

}

export default PlayGame

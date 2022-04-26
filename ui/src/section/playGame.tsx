import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
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
  clearGame
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import { leaveGame } from '../game/game'

import StepMessageWidget from '../component/stepMessageWidget'

const PlayGame = (props:{
  transactionManager : TransactionManager,
  contract : ethers.Contract,
}) => {

  const [gameContract, setGameContract] = useState<ethers.Contract>()

  const stepId = StepId.Game
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const gameId = useAppSelector((state) => state.gameSlice.gameId)
  const game = useAppSelector((state) => state.gameSlice.game)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  const gameInfo = () => {
    if (game)
    return (
      <>
      Id : {game.id}<br/>
      UserId1 : {game.userId1}<br/>
      UserId2 : {game.userId2}<br/>
      GameCard1 : {game.cardList1.map(card => card.userCardId).toString()}<br/>
      GameCard2 : {game.cardList2.map(card => card.userCardId).toString()}<br/>
      latestTime : {game.latestTime}<br/>
      version : {game.version}<br/>
      turn : {game.turn}<br/>
      winner : {game.winner}<br/>
      </>
    )
    return (<>Game not set</>)
  }

  if (isStep(stepId, Step.Waiting, step)) {
    const gameItem = gameList.filter(_gameItem => _gameItem.id === gameId)[0]
    if (gameItem && gameItem.userId2 !== 0){
      setTimeout(() => {dispatch(updateStep({id : stepId, step : Step.Ready}))}, 100)
    }
  }

  const myTurn = () => {
    if (user && game){
      if (game.turn % 2 === 0 && game.userId1 === user.id){
        return 1
      }
      if (game.turn % 2 === 1 && game.userId2 === user.id){
        return 1
      }
    }
    return 0
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

  const _leaveGame = () => {
    if (gameContract){
      leaveGame(gameContract, props.transactionManager).then(() => {

      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
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
    {isStep(stepId, Step.Waiting, step) &&
      <Row><Col>Waiting for opponent {gameList.length}</Col></Row>
    }
    {isStep(stepId, Step.Loading, step) &&
      <Row><Col>Loading</Col></Row>
    }
    {
      isStep(stepId, Step.Running, step) &&
      <>
      <Row>
        <Col>
          {!!myTurn() && <div>My turn</div>}
          {gameInfo()}
          <Button onClick={_leaveGame}>Leave game</Button>
        </Col>
      </Row>
      { game &&
        <GameBoard
          game={game}
          cardList={cardList}
        />
      }
      </>
    }
    {
      isStep(stepId, Step.Ended, step) &&
      <Row>
        <Col>
          {!!isWinner() && <div>You Win!!!</div>}
          {!isWinner() && <div>You Lose!!!</div>}
          {gameInfo()}
          <Button onClick={_exitGame}>Ok</Button>
        </Col>
      </Row>
    }
    <Row>
      <Col>
      </Col>
    </Row>
    </>
  )

}

export default PlayGame

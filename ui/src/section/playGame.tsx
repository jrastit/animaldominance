import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DivNice from '../component/divNice'
import ButtonNice from '../component/buttonNice'
import GameLoader from '../loader/gameLoader'
import GameBoard from '../game/gameComponent/gameBoard'
import GameWaitingWidget from '../game/gameComponent/gameWaitingWidget'
import GameEndedWidget from '../game/gameComponent/gameEndedWidget'

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
  addPlayAction,
} from '../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  endTurn,
  leaveGame,
  endGameByTime,
} from '../game/game'

import StepMessageNiceWidget from '../component/stepMessageNiceWidget'

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

  const playActionList = useAppSelector((state) => state.gameSlice.playActionList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  const _addPlayAction = (payload: {
    turn: number,
    actionId: number,
    data: number[]
  }) => {
    console.log(payload)
    dispatch(addPlayAction(payload))
  }

  const _playTurn = (playActionList : number[][], cardNextId0: number, cardNextId1 : number, turn : number) => {
    if (gameContract){
      dispatch(updateStep({id : stepId, step : Step.Refresh}))
      endTurn(
        gameContract,
        props.transactionManager,
        playActionList,
        turn,
        cardNextId0,
        cardNextId1,
        _addPlayAction
      ).then(() => {
        dispatch(updateStep({id : stepId, step : Step.Running}))
      }).catch((err) => {
        console.log(err)
        dispatch(setError({id:stepId, catchError:err}))
      })
    }
  }

  const _leaveGame = () => {
    if (gameContract){
      dispatch(updateStep({id : stepId, step : Step.Loading}))
      leaveGame(gameContract, props.transactionManager).then(() => {
        dispatch(updateStep({id : stepId, step : Step.Ended}))
      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }

  }

  const _endGameByTime = () => {
    if (gameContract){
      endGameByTime(gameContract, props.transactionManager).then(() => {
      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }
  }

  const render = () => {
    if (isStep(stepId, Step.Waiting, step)){
      return (<GameWaitingWidget
      contract={props.contract}
      transactionManager={props.transactionManager}
      />)
    } else if (
      isStep(stepId, Step.Creating, step) ||
      isStep(stepId, Step.Loading, step) ||
      isStep(stepId, Step.Joining, step) ||
      isStep(stepId, Step.Error, step)
    ) {
      return (
        <DivNice>
        <StepMessageNiceWidget
          title='Game'
          step={getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        </DivNice>
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
            isRefresh={isStep(stepId, Step.Refresh, step)}
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
        <GameEndedWidget/>
      )
    } else {
      return (
        <DivNice>Unknow step {Step[getStep(StepId.Game, step).step]}</DivNice>
      )
    }
  }

  return (
    <>
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

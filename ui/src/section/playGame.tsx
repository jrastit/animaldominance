import {ContractCardAdmin} from '../contract/solidity/compiled/contractAutoFactory'
import {ContractPlayGame} from '../contract/solidity/compiled/contractAutoFactory'
import { useState } from 'react'

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

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  leaveGame,
} from '../game/game'

import StepMessageNiceWidget from '../component/stepMessageNiceWidget'

const PlayGame = (props:{
  contract : ContractCardAdmin,
}) => {

  const [gameContract, setGameContract] = useState<ContractPlayGame>()

  const stepId = StepId.Game
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const game = useAppSelector((state) => state.gameSlice.game)
  const oponent = useAppSelector((state) => state.gameSlice.oponent)

  const dispatch = useAppDispatch()

  const _leaveGame = () => {
    if (gameContract){
      dispatch(updateStep({id : stepId, step : Step.Loading}))
      leaveGame(gameContract).then(() => {
        dispatch(updateStep({id : stepId, step : Step.Ended}))
      }).catch((err) => {dispatch(setError({id:stepId, catchError:err}))})
    }

  }

  const render = () => {
    if (isStep(stepId, Step.Waiting, step)){
      return (<GameWaitingWidget
      contract={props.contract}
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
      if (game && user && oponent && gameContract){
        return (
          <GameBoard
            gameContract={gameContract}
            game={game}
            user={user}
            oponent={oponent}
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
        if (!gameContract) {
          return (
            <DivNice>Error gameContract not set</DivNice>
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

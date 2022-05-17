import ButtonNice from '../../component/buttonNice'
import DivNice from '../../component/divNice'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  Step,
  StepId,
  updateStep,
} from '../../reducer/contractSlice'

import {
  cleanGame
} from '../../reducer/gameSlice'

import {
  endGameId
} from '../../reducer/userSlice'

const GameEndedWidget = () => {

  const game = useAppSelector((state) => state.gameSlice.game)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const isWinner = () => {
    if (user && game){
      if (game.winner === user.id){
        return 1
      }
    }
    return 0
  }

  const _exitGame = () => {
    dispatch(cleanGame())
    game && dispatch(endGameId(game.id))
    dispatch(updateStep({id : StepId.Game, step : Step.Init}))
  }

  return (
    <DivNice>
        {!!isWinner() && <div>You Win game {game && game.id}!!!</div>}
        {!isWinner() && <div>You Lose game {game && game.id}!!!</div>}
        <ButtonNice onClick={_exitGame}>Ok</ButtonNice>
    </DivNice>
  )
}

export default GameEndedWidget

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import { clearGame } from '../reducer/gameSlice'

import {
  StepId,
  getStep,
} from '../reducer/contractSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

const AdminGame = () => {
  const stepId = StepId.Game
  const step = useAppSelector((state) => state.contractSlice.step)
  const game = useAppSelector((state) => state.gameSlice.game)
  const dispatch = useAppDispatch()

  const _leaveGame = () => {
    dispatch(clearGame())
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Games' hide={false}>
      <StepMessageWidget
        step = {getStep(stepId, step)}
      />
      {!!game &&
        <Button onClick={_leaveGame}>Leave {game.id}</Button>
      }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminGame

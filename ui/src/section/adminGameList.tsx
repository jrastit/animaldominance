import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  getStep,
  StepId,
  clearError,
} from '../reducer/contractSlice'

const AdminGame = () => {
  const stepId = StepId.GameList
  const step = useAppSelector((state) => state.contractSlice.step)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)
  const dispatch = useAppDispatch()

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Games' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        {gameList && gameList.length > 0 &&
        <>
          {gameList.length} Games
        </>
      }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminGame

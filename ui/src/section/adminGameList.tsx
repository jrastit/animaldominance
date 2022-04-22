import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import { useAppSelector } from '../hooks'

import {
  getStep,
  StepId,
} from '../reducer/contractSlice'

const AdminGame = () => {
  const stepId = StepId.GameList
  const step = useAppSelector((state) => state.contractSlice.step)
  const gameList = useAppSelector((state) => state.gameSlice.gameList)

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Games' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
        />
        {gameList && gameList.length > 0 &&
        <>
          {gameList.length * 6} Games
        </>
      }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminGame

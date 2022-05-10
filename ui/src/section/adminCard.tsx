import { useEffect } from 'react'

import {
  loadAllCardFromFile,
} from '../game/card'

import { setCardList } from '../reducer/cardListSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'
import DownloadCardList from '../game/component/downloadCards'

import {
  getStep,
  StepId,
  clearError,
} from '../reducer/contractSlice'

const AdminCard = ()=> {
  const stepId = StepId.CardList
  const step = useAppSelector((state) => state.contractSlice.step)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!cardList || cardList.length === 0){
      dispatch(setCardList(loadAllCardFromFile()))
    }
  }, [dispatch, cardList])

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Game Card' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        {cardList.length > 0 &&
          <>
            {cardList.length * 6} Cards
          </>
        }
        <br/><DownloadCardList
        cardList={cardList}
        />
      </BoxWidgetHide>
    </SpaceWidget>
  )

}


export default AdminCard

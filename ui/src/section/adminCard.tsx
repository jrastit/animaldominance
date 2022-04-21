import { useEffect } from 'react'

import {
  loadAllCardFromFile,
} from '../game/card'

import { setCardList } from '../reducer/cardListSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

const AdminCard = ()=> {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!cardList || cardList.length === 0){
      dispatch(setCardList(loadAllCardFromFile()))
    }
  }, [dispatch, cardList])

  const render = () => {

    if (cardList){
      return (
        <>
        {cardList.length * 6} Cards
        </>
      )
    }

    return (
      <p>no card found</p>
    )

  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Local Game Card' hide={false}>
        {render()}
      </BoxWidgetHide>
    </SpaceWidget>
  )

}


export default AdminCard

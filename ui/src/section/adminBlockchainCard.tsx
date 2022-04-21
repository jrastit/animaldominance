import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import {
  loadAllCard,
} from '../game/card'

import { setCardList } from '../reducer/cardListSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

const AdminBlockchainCard = (props: {
  transactionManager : TransactionManager,
  contract : ethers.Contract,
})=> {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  //const [cardList, setCardList] = useState<CardType[]>()
  const [loading, setLoading] = useState(0)
  const [message, setMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!loading){
      setLoading(1);
      loadAllCard(props.contract, setMessage).then((_cardList) => {
        dispatch(setCardList(_cardList))
        setLoading(2)
      })
    }
  }, [setLoading, loading, cardList, props.contract, dispatch])

  const render = () => {
    if (loading % 2 === 1){
      return (
        <div>Card explorer loading...<br/>{message}</div>
      )
    }

    if (cardList){
      return (
        <>
        {cardList.length * 6} Cards
        </>
      )
    }

    return (
      <p>card explorer empty</p>
    )

  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Blockchain Game Card' hide={false}>
        {render()}
      </BoxWidgetHide>
    </SpaceWidget>
  )

}


export default AdminBlockchainCard

import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import type {
  CardType
} from '../type/cardType'

import {
  loadAllCard
} from '../game/card'


const CardExplorer = (props: {
  transactionManager : TransactionManager,
  contract : ethers.Contract,
})=> {

  const [cardList, setCardList] = useState<CardType[]>()
  const [loading, setLoading] = useState(0)

  useEffect(() => {
    if (!loading && !cardList){
      setLoading(1);
      loadAllCard(props.contract).then((_cardList) => {
        setCardList(_cardList)
        setLoading(2)
      })
    }
  }, [setLoading, loading, cardList, props.contract])

  if (loading){
    return (
      <p>loading...</p>
    )
  }

  if (cardList){
    return (
      <p>card : {cardList.length}</p>
    )
  }

  return (
    <p>card explorer empty</p>
  )
}


export default CardExplorer

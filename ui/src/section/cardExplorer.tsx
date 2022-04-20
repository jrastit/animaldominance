import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import type {
  CardType
} from '../type/cardType'

import {
  loadAllCard,
  loadAllCardFromFile,
} from '../game/card'

import CardListWidget from '../game/component/cardListWidget'

const CardExplorer = (props: {
  transactionManager : TransactionManager,
  contract ?: ethers.Contract,
})=> {

  const [cardList, setCardList] = useState<CardType[]>()
  const [loading, setLoading] = useState(0)
  const [message, setMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!loading && !cardList){
      setLoading(1);
      if (props.contract){
        loadAllCard(props.contract, setMessage).then((_cardList) => {
          setCardList(_cardList)
          setLoading(2)
        })
      } else {
        loadAllCardFromFile().then((_cardList) => {
          setCardList(_cardList)
          setMessage("")
          setLoading(2)
        })
      }
    }
  }, [setLoading, loading, cardList, props.contract])

  if (loading % 2 === 1){
    return (
      <div>Card explorer loading...<br/>{message}</div>
    )
  }

  if (cardList){
    return (
      <CardListWidget
        cardList={cardList}
      />
    )
  }

  return (
    <p>card explorer empty</p>
  )
}


export default CardExplorer

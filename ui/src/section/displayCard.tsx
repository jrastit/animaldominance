import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import CardListWidget from '../game/component/cardListWidget'

import { buyNewCard } from '../game/card'
import { useAppSelector } from '../hooks'

const DisplayCard = (props : {
  contract ?: ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)

  const _buyNewCard = (cardId : number, value : number) => {
    if (props.contract){
      buyNewCard(props.contract, props.transactionManager, cardId, value)
    }
  }

  if (cardList) {
    return (
      <CardListWidget
        buyNewCard={props.contract && _buyNewCard}
        cardList={cardList}
      />
    )
  }

  return (<></>)
}

export default DisplayCard

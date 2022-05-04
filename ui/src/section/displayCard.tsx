import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import CardListWidget from '../game/component/cardListWidget'

import { buyNewCard } from '../game/card'
import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  Step,
  StepId
} from '../reducer/contractSlice'

const DisplayCard = (props : {
  contract ?: ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  const _buyNewCard = (cardId : number, value : number) => {
    if (props.contract){
      buyNewCard(props.contract, props.transactionManager, cardId, value).then(
        () => {
          dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
        }
      )
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

import CardListWidget from '../game/component/cardListWidget'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  setCard,
  setCardLevel,
} from '../reducer/cardListSlice'


const DisplayCard = () => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const tradeList = useAppSelector((state) => state.cardListSlice.tradeList)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const _setCard = (card : {
    cardId: number,
    mana: number,
    family: number,
    starter: number,
    name: string
  }) => {
    dispatch(setCard(card))
  }

  const _setCardLevel = (level : {
    cardId: number,
    level: number,
    attack: number,
    life: number,
    description: string
  }) => {
    dispatch(setCardLevel(level))
  }

  if (cardList) {
    return (
      <CardListWidget
        cardList={cardList}
        tradeList={tradeList}
        userId={user?.id}
        setCard={_setCard}
        setCardLevel={_setCardLevel}
      />
    )
  }

  return (<></>)
}

export default DisplayCard

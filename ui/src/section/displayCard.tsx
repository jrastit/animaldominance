import CardListWidget from '../game/component/cardListWidget'

import { useAppSelector } from '../hooks'

const displayCard = () => {
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)

  if (cardList) {
    return (
      <CardListWidget
        cardList={cardList}
      />
    )
  }

  return (<></>)
}

export default displayCard

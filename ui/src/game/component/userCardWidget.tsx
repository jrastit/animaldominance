import type {
  UserCardType
} from '../../type/userType'

import CardWidget from './cardWidget'

import { useAppSelector } from '../../hooks'

const UserCardWidget = (props : {
  userCard : UserCardType,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)

  let level = 0
  if (props.userCard.exp > 10) level = 1
  if (props.userCard.exp > 100) level = 2
  if (props.userCard.exp > 1000) level = 3
  if (props.userCard.exp > 10000) level = 4
  if (props.userCard.exp > 100000) level = 5

  const card = cardList.filter(card => card.id === props.userCard.cardId)[0]

  return (
    <CardWidget
      card={card}
      level={level}
    />
  )
}

export default UserCardWidget

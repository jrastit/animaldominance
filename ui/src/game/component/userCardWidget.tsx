import type {
  UserCardType
} from '../../type/userType'

import {
  getLevel
} from '../../game/card'

import CardWidget from './cardWidget'

import { useAppSelector } from '../../hooks'

const UserCardWidget = (props: {
  userCard: UserCardType,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const level = getLevel(props.userCard.exp)
  const card = cardList.filter(card => card.id === props.userCard.cardId)[0]

  if (!card) {
    return (
      <CardWidget
        family={0}
        mana={0}
        name={'Loading...'}
        level={level}
        attack={0}
        life={0}
        description={'Loading...'}
        exp={props.userCard.exp}
      />
    )

  }

  return (
        <CardWidget
          family={card.family}
          mana={card.mana}
          name={card.name}
          level={level}
          attack={card.level[level].attack}
          life={card.level[level].life}
          description={card.level[level].description}
          exp={props.userCard.exp}
        />
  )
}

export default UserCardWidget

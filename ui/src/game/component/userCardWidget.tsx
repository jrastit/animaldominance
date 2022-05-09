import { useState } from 'react'

import type {
  UserCardType
} from '../../type/userType'

import {
  getLevel
} from '../../game/card'

import CardWidget from './cardWidget'

import { useAppSelector } from '../../hooks'

import DragHelper from '../../component/dragHelper'

const UserCardWidget = (props: {
  userCard: UserCardType,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)

  const level = getLevel(props.userCard.exp)

  const card = cardList.filter(card => card.id === props.userCard.cardId)[0]

  const [translate, setTranslate] = useState({
    x: 0,
    y: 0
  });

  const handleDragMove = (e: any) => {
    setTranslate({
      x: translate.x + e.movementX,
      y: translate.y + e.movementY
    });
  };

  return (
    <DragHelper
      onDragMove={handleDragMove}
      onPointerUp={() => {
        setTranslate({x : 0, y : 0})
      }}
    >
      <div style={{
        transform: `translateX(${translate.x}px) translateY(${translate.y}px)`
      }}
      >
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
      </div>
    </DragHelper>

  )
}

export default UserCardWidget

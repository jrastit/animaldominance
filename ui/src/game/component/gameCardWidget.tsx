import {
  getLevel
} from '../../game/card'

import { CardType } from '../../type/cardType'
import { GameCardType } from '../../type/gameType'

import CardWidget from './cardWidget'

import DragHelper from '../../component/dragHelper2'
import DropHelper from '../../component/dropHelper'

const GameCardWidget = (props : {
  cardList : CardType[],
  gameCard : GameCardType,
  draggable : boolean,
  onDrop ?: (data : string, gameCard : GameCardType) => void
}) => {

  const card = props.cardList.filter((card) => card.id === props.gameCard.cardId)[0]

  const level = getLevel(props.gameCard.exp)

  const family = card ? card.family : 0

  const name = card ? card.name : 'loading...'

  const description = card ? card.level[level].description : 'loading...'

  const renderCard = () => {
    return (
      <CardWidget
        family={family}
        mana={props.gameCard.mana}
        name={name}
        level={level}
        attack={props.gameCard.attack}
        life={props.gameCard.life}
        description={description}
        exp={props.gameCard.exp + props.gameCard.expWin}
      />
    )
  }

  if (props.draggable){
    return (
      <DragHelper
        data={props.gameCard.id}
        dropEffect='move'
      >
      {renderCard()}
      </DragHelper>

    )
  }

  if (props.onDrop) {
    return (
      <DropHelper
        onDrop={(data : string) => props.onDrop && props.onDrop(data, props.gameCard)}
      >
      {renderCard()}
      </DropHelper>
    )
  }

  return renderCard()

}

export default GameCardWidget

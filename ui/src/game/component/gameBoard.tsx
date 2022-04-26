import { GameType, GameCardType } from '../../type/gameType'
import { CardType } from '../../type/cardType'

import CardWidget from './cardWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {
  getLevel
} from '../../game/card'

const GameBoard = (props : {
  game : GameType,
  cardList : CardType[],
}) => {

  const displayGameCard = (gameCard : GameCardType) => {
    const card = props.cardList.filter((card) => card.id === gameCard.cardId)[0]
    const level = getLevel(gameCard.exp)
    return (
      <CardWidget
        family={card.family}
        mana={gameCard.mana}
        name={card.name}
        level={level}
        attack={gameCard.attack}
        life={gameCard.life}
        description={card.level[level].description}
      />
    )
  }

  const displayGameCardList = (gameCardList : GameCardType[] ) => {
    return (
      <Row>
      {gameCardList.map((_card) => {
        return (
          <Col>
            {displayGameCard(_card)}
          </Col>
        )
      })}
      </Row>
    )
  }

  return (
    <>
    <Row>
      <Col xs={6}>
        {displayGameCardList(props.game.cardList1)}
      </Col>
    </Row>
    <Row>
      <Col xs={6}>
        {displayGameCardList(props.game.cardList2)}
      </Col>
    </Row>
    </>
  )
}

export default GameBoard

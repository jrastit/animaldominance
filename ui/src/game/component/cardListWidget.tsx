import type {
  CardType
} from '../../type/cardType'

import CardWidget from './cardWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'



const cardListWidget = (props : {
  cardList : Array<CardType>
}) => {

  const displayCard = (card : CardType) => {
    return (
      <Row>
        {card.level.map((_cardLevel, level : number) => displayCardLevel(card, level))}
      </Row>
    )
  }

  const displayCardLevel = (card : CardType, level : number) => {
    return (
      <Col xs={2}>
        <CardWidget
          card={card}
          level={level}
        />
      </Col>
    )
  }

  return (
    <Container>
      {props.cardList.map(displayCard)}
    </Container>

  )
}

export default cardListWidget

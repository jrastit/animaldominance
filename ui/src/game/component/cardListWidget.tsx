import {ethers} from 'ethers'

import type {
  CardType
} from '../../type/cardType'

import type {
  TradeType
} from '../../type/tradeType'

import CardWidget from './cardWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'

const cardListWidget = (props : {
  cardList : Array<CardType>
  tradeList : TradeType[][][] | undefined
  buyNewCard ?: (cardId : number, value : number) => void
  buyCard ?: (userdId : number, userCardId : number, value : ethers.BigNumber) => void
  userId : number | undefined
}) => {
  const displayCard = (card : CardType) => {
    const price = card.starter ? 1 : 10
    return (
      <Row key={card.id} style={{backgroundColor : card.starter ? 'white' : 'black'}}>
        <Col xs={3}>
          <Row>
            {props.buyNewCard &&
              <Col>
                <Button
                  variant='primary'
                  onClick={() => props.buyNewCard &&
                    props.buyNewCard(card.id, price)
                  }
                >
                  Buy a {card.name} level 0 for {price} ROSE
                </Button>
              </Col>
            }
            {props.tradeList && props.tradeList[card.id - 1] && props.tradeList[card.id - 1].map((tradeLevelList, level)=>{
                if (tradeLevelList.length){
                  const minTrade = tradeLevelList.reduce((prev, current) => {
                    return (prev.price.lte(current.price) && prev.userId !== props.userId) ? prev : current
                  })
                  if (minTrade.userId !== props.userId){
                    return (
                    <Row key={card.id + ' ' + level}>
                    <Col>
                      <Button
                        variant='primary'
                        onClick={() => props.buyCard &&
                          props.buyCard(minTrade.userId, minTrade.userCardId, minTrade.price)
                        }
                      >
                        Buy {card.name} level {level} for {ethers.utils.formatEther(minTrade.price)} ROSE
                      </Button>
                    </Col>
                    </Row>
                    )
                  }
                }
            })

            }
          </Row>
        </Col>
        <Col xs={9}>
          <Row>
            {card.level.map((_cardLevel, level : number) => displayCardLevel(card, level))}
          </Row>
        </Col>
      </Row>
    )
  }

  const displayCardLevel = (card : CardType, level : number) => {
    let exp = 0
    switch (level) {
      case 1:
      exp = 10
      break;
      case 2:
      exp = 100
      break;
      case 3:
      exp = 1000
      break;
      case 4:
      exp = 10000
      break;
      case 5:
      exp = 100000
      break;
      case 6:
      exp = 1000000
      break;
    }
    return (
      <Col xs={2} key={level}>
      <div style={{padding:".5em"}}>
        <CardWidget
          family={card.family}
          mana={card.mana}
          name={card.name}
          level={level}
          attack={card.level[level].attack}
          life={card.level[level].life}
          description={card.level[level].description}
          exp={exp}
        />
      </div>
      </Col>
    )
  }

  return (
    <Container fluid>
      {props.cardList.map(displayCard)}
    </Container>

  )
}

export default cardListWidget

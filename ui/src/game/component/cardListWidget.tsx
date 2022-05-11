import {ethers} from 'ethers'

import type {
  CardType,
  CardLevelType,
} from '../../type/cardType'

import type {
  TradeType
} from '../../type/tradeType'

import CardWidget from './cardWidget'

import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import FormControl from 'react-bootstrap/FormControl'

import ButtonNice from '../../component/buttonNice'
import DivFullNice from '../../component/divFullNice'
import SpaceWidget from '../../component/spaceWidget'

const CardEditFrom = (props : {
  name : string,
  value : string,
  onChange : (e : any) => void
}) => {
  return (
    <Form.Group as={Row} className="mb-3">
    <Form.Label column sm="3">
      {props.name}
    </Form.Label>
    <Col sm="9">
      <FormControl  value={props.value} onChange={(e) => {
        console.log(props.name, e.target.value)
        /*if (e.target.value)*/ props.onChange(e)}
      }/>
    </Col>
  </Form.Group>
  )
}

const CardListWidget = (props : {
  cardList : Array<CardType>
  tradeList : TradeType[][][] | undefined
  buyNewCard ?: (cardId : number, value : number) => void
  buyCard ?: (userdId : number, userCardId : number, value : ethers.BigNumber) => void
  setCard ?: (card : {
    cardId: number,
    mana: number,
    family: number,
    starter: number,
    name: string
  }) => void
  setCardLevel ?: (level : {
    cardId: number,
    level: number,
    attack: number,
    life: number,
    description: string
  }) => void
  userId : number | undefined
}) => {

  const editCardLevel = (cardId : number, levelId : number, level : CardLevelType) => {
    return (
      <div key={levelId}>
      <Row>
      <Col xs='2'>
      Level {levelId}
      </Col>
      <Col>
      <CardEditFrom
      name='attack'
      value={level.attack.toString()}
      onChange={(e) => {
        props.setCardLevel && props.setCardLevel({
          cardId,
          level : levelId,
          life : level.life,
          attack : parseInt(e.target.value),
          description : level.description,
        })
      }}/>
      </Col><Col>
      <CardEditFrom
      name={'life'}
      value={level.life.toString()}
      onChange={(e) => {
        props.setCardLevel && props.setCardLevel({
          cardId,
          level : levelId,
          life : parseInt(e.target.value),
          attack : level.attack,
          description : level.description,
        })
      }}/>
      </Col></Row><Row><Col>
      <CardEditFrom
      name='description'
      value={level.description}
      onChange={(e) => {
        props.setCardLevel && props.setCardLevel({
          cardId,
          level : levelId,
          life : level.life,
          attack : level.attack,
          description : e.target.value,
        })
      }}></CardEditFrom></Col>
      </Row>
      </div>
    )
  }

  const editCard = (card : CardType) => {
    return (
      <div>
      <Row>
      <Col>
      <CardEditFrom
      name='mana'
      value={card.mana.toString()}
      onChange={(e) => {
        props.setCard && props.setCard({
          cardId : card.id,
          mana : parseInt(e.target.value),
          family : card.family,
          starter : card.starter,
          name : card.name,
        })
      }}/>
      </Col><Col>
      <CardEditFrom
      name='family'
      value={card.family.toString()}
      onChange={(e) => {
        props.setCard && props.setCard({
          cardId : card.id,
          mana : card.mana,
          family : parseInt(e.target.value),
          starter : card.starter,
          name : card.name,
        })
      }}/>
      </Col><Col>
      <CardEditFrom
      name='starter'
      value={card.starter.toString()}
      onChange={(e) => {
        props.setCard && props.setCard({
          cardId : card.id,
          mana : card.mana,
          family : card.family,
          starter : parseInt(e.target.value),
          name : card.name,
        })
      }}/>
      </Col><Row></Row><Col>
      <CardEditFrom
      name='name'
      value={card.name}
      onChange={(e) => {
        props.setCard && props.setCard({
          cardId : card.id,
          mana : card.mana,
          family : card.family,
          starter : card.starter,
          name : e.target.value,
        })
      }}/>
      </Col>
      </Row>
      {editCardAllLevel(card)}
      </div>
    )
  }

  const editCardAllLevel = (card : CardType) => {
    const ret = []
    for (let level = 0; level < 6; level++) {
      ret.push(editCardLevel(card.id, level, card.level[level]))
    }
    return ret
  }

  const displayCard = (card : CardType) => {
    const price = card.starter ? 1 : 10
    return (
      <DivFullNice>
      <Row key={card.id}>
        <Col xs={3}>

            {props.buyNewCard &&
              <SpaceWidget>
                <ButtonNice
                  onClick={() => props.buyNewCard &&
                    props.buyNewCard(card.id, price)
                  }
                >
                  Buy a {card.name} level 0 for {price} ROSE
                </ButtonNice>
              </SpaceWidget>
            }
            {props.buyCard && props.tradeList && props.tradeList[card.id - 1] && props.tradeList[card.id - 1].map((tradeLevelList, level)=>{
                if (tradeLevelList.length){
                  const minTrade = tradeLevelList.reduce((prev, current) => {
                    return (prev.price.lte(current.price) && prev.userId !== props.userId) ? prev : current
                  })
                  if (minTrade.userId !== props.userId){
                    return (
                    <SpaceWidget key={card.id + ' ' + level}>
                      <ButtonNice
                        onClick={() => props.buyCard &&
                          props.buyCard(minTrade.userId, minTrade.userCardId, minTrade.price)
                        }
                      >
                        Buy {card.name} level {level} for {ethers.utils.formatEther(minTrade.price)} ROSE
                      </ButtonNice>
                    </SpaceWidget>
                    )
                  }
                }
            })

            }
            {props.setCard && props.setCardLevel &&
              <>
              {
                editCard(card)
              }
              </>

            }
        </Col>
        <Col xs={9}>
          <Row>
            {card.level.map((_cardLevel, level : number) => displayCardLevel(card, level))}
          </Row>
        </Col>
      </Row>
      </DivFullNice>
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

export default CardListWidget

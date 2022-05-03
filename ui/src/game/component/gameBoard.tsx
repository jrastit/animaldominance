import { useEffect, useState } from 'react'
import { GameType, GameCardType, TurnDataType } from '../../type/gameType'
import { CardType } from '../../type/cardType'
import { UserType } from '../../type/userType'

import CardWidget from './cardWidget'
import UserGameWidget from './userGameWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'

import {
  getLevel
} from '../../game/card'

import {
  isMyTurn,
  getTurnData,
  playRandomly,
} from '../../game/playGame'

const GameBoard = (props : {
  user : UserType,
  oponent : UserType,
  game : GameType,
  cardList : CardType[],
  children: any,
  endGameByTime: () => void,
  endTurn:(action : number[][], turn : number) => void
}) => {

  const getTimestamp = () => {
    return Date.now();
  }

  const [timestamp, setTimestamp] = useState<number>(getTimestamp())
  const [turnData, setTurnData] = useState<TurnDataType>({
    mana : 0,
    playActionList : [],
    cardList1: [],
    cardList2: [],
    life1 : 0,
    life2 : 0,
  })

  const turn = props.game.turn
  const myTurn = isMyTurn(turn, props.game.userId1, props.user.id)

  useEffect(() => {
    setTurnData(getTurnData(props.game, props.user.id))
  }, [turn, props.user.id, props.game])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimestamp(getTimestamp())
    }, 100);

    return () => clearTimeout(timer)
  })



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
        exp={gameCard.exp + gameCard.expWin}
      />
    )
  }

  const displayUser = (user : UserType, life : number) => {
    const card = props.cardList.filter((card) => card.id === 1)[0]
    const level = getLevel(user.rank)
    return (
      <UserGameWidget
        userName={"#" + user.id}
        family={card.family}
        name={card.name}
        mana={turnData.mana}
        level={level}
        attack={0}
        life={life}
      />
    )
  }

  const displayGameCardList = (gameCardList : GameCardType[] ) => {
    return (
      <Row>
      {gameCardList.map((_card, id) => {
        return (
          <Col key={id}>
            {displayGameCard(_card)}
          </Col>
        )
      })}
      </Row>
    )
  }

  let remainingTime = 180 - ((timestamp/1000) - (props.game.latestTime))
  if (remainingTime < 0) {
    remainingTime = 0
  }
  const remaining_min = (Math.floor(remainingTime / 60))
  const remaining_sec = (Math.floor(remainingTime) % 60)
  const remaining_label =
    (remaining_min ? remaining_min + ':' : '') +
    (remaining_sec < 10 ? '0' : '') +
    remaining_sec

  return (
    <div style={{fontSize : "11px"}}>
    <Row style={{height : "20em", overflow : "hidden", backgroundColor:"grey", padding:"1em"}}>
      <Col xs={6}>
        {displayGameCardList(
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 1
          )
        )}
      </Col>
      <Col xs={2} style={{backgroundColor:"gold"}}>
      {displayUser(props.oponent, turnData.life2)}
      </Col>
      <Col xs={4}>
        {displayGameCardList(
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 2
          )
        )}
      </Col>
    </Row>
    <Row  style={{height : "20em", backgroundColor:"black", padding:"1em"}}>
    {displayGameCardList(
      turnData.cardList2.filter(
        _gameCard => _gameCard.position === 3
      )
    )}
    </Row>
    <div>

    {(remainingTime > 0 || !!myTurn) &&
      <ProgressBar now={(remainingTime) * 100 / 180} label={remaining_label}/>
    }
    {remainingTime === 0 && !myTurn &&
      <div style={{textAlign : 'center'}}><Button onClick={props.endGameByTime}>Win game by time</Button></div>
    }

    </div>
    <Row  style={{height : "20em", backgroundColor:"black", padding:"1em"}}>
    {displayGameCardList(
      turnData.cardList1.filter(
        _gameCard => _gameCard.position === 3
      )
    )}
    </Row>
    <Row  style={{height : "20em", backgroundColor:"grey", padding:"1em"}}>
      <Col xs={6}>
      {displayGameCardList(
        turnData.cardList1.filter(
          _gameCard => _gameCard.position === 1
        )
      )}
      </Col>
      <Col xs={2} style={{backgroundColor:"gold"}}>
      {displayUser(props.user, turnData.life1)}
      </Col>
      <Col xs={3}>
        {displayGameCardList(
          turnData.cardList1.filter(
            _gameCard => _gameCard.position === 2
          )
        )}
      </Col>
      <Col xs={1}>
      { !!myTurn &&
        <>
        { playRandomly(turnData, setTurnData, true) === 1 &&
          <Button onClick={() => {playRandomly(turnData, setTurnData)}}>Play randomly</Button>
        }
        <Button onClick={() => {props.endTurn(turnData.playActionList, turn)}}>End turn</Button>
        </>

      }
      {props.children}
      <div>Turn : {turn}</div>
      </Col>
    </Row>
    </div>
  )
}

export default GameBoard

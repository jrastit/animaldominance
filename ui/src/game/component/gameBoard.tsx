import { useEffect, useState } from 'react'
import { GameType, GameCardType } from '../../type/gameType'
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

const _myTurn = (turn : number, userId1 : number, userId : number) => {
  if (turn % 2 === 0 && userId1 === userId){
    return 1
  }
  if (turn % 2 === 1 && userId1 !== userId){
    return 1
  }
  return 0
}

const GameBoard = (props : {
  user : UserType,
  oponent : UserType,
  game : GameType,
  cardList : CardType[],
  children: any,
  endGameByTime: () => void,
  playTurn:(action : number[][]) => void
}) => {

  const getTimestamp = () => {
    return Date.now();
  }

  const [timestamp, setTimestamp] = useState<number>(getTimestamp())
  const [turnData, setTurnData] = useState<{
    mana : number,
    playActionList : number[][],
    cardList1: GameCardType[],
    cardList2: GameCardType[],
  }>({
    mana : 0,
    playActionList : [],
    cardList1: [],
    cardList2: [],
  })

  const turn = props.game.turn
  const myTurn = _myTurn(turn, props.game.userId1, props.user.id)

  useEffect(() => {
    setTurnData({
      mana : Math.floor(turn / 2) + 1,
      playActionList : [],
      cardList1 : props.user.id === props.game.userId1? props.game.cardList1 : props.game.cardList2,
      cardList2 : props.user.id === props.game.userId1? props.game.cardList2 : props.game.cardList1,
    })
  }, [turn, props.user.id, props.game.userId1, props.game.cardList1, props.game.cardList2])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimestamp(getTimestamp())
    }, 100);

    return () => clearTimeout(timer)
  })

  const playCardTo3 = (gameCard : GameCardType, cardList1 : GameCardType[]) => {
    gameCard.position = 3
    const newTurnData = {
      playActionList : turnData.playActionList.concat([[gameCard.id, 3]]),
      mana : turnData.mana - gameCard.mana,
      cardList1 : cardList1,
      cardList2 : turnData.cardList2.concat([]),
    }
    setTurnData(newTurnData)
  }

  const playRandomly = () => {
    const cardList1 = turnData.cardList1.map((_gameCard : GameCardType) => {
      return {
        ..._gameCard
      } as GameCardType
    })
    for (let i = 0; i < cardList1.length; i++){
      const gameCard = cardList1[i]
      if (gameCard.position === 1 && gameCard.mana <= turnData.mana){
        if (turnData.playActionList.filter(_action => _action[0] === gameCard.id).length === 0){
          playCardTo3(gameCard, cardList1)
          return
        }
      }
    }
  }

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

  const displayUser = (user : UserType) => {
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
        life={20}
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
    <>
    <Row style={{height : "7em", overflow : "hidden"}}>
      <Col xs={6}>
        {displayGameCardList(
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 1
          )
        )}
      </Col>
      <Col xs={2}>
      {displayUser(props.oponent)}
      </Col>
      <Col xs={4}>
        {displayGameCardList(
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 2
          )
        )}
      </Col>
    </Row>
    <Row  style={{height : "17em"}}>
    {displayGameCardList(
      turnData.cardList2.filter(
        _gameCard => _gameCard.position === 3
      )
    )}
    </Row>
    <Row>
    <Col>
    {(remainingTime > 0 || !!myTurn) &&
      <ProgressBar now={(remainingTime) * 100 / 180} label={remaining_label}/>
    }
    {remainingTime === 0 && !myTurn &&
      <Button onClick={props.endGameByTime}>Win game by time</Button>
    }
    </Col>
    </Row>
    <Row  style={{height : "17em"}}>
    {displayGameCardList(
      turnData.cardList1.filter(
        _gameCard => _gameCard.position === 3
      )
    )}
    </Row>
    <Row  style={{height : "17em"}}>
      <Col xs={6}>
      {displayGameCardList(
        turnData.cardList1.filter(
          _gameCard => _gameCard.position === 1
        )
      )}
      </Col>
      <Col xs={2}>
      {displayUser(props.user)}
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
        <Button onClick={playRandomly}>Play randomly</Button>
        <Button onClick={() => {props.playTurn(turnData.playActionList)}}>Play turn</Button>
        </>

      }
      {props.children}
      <div>Turn : {turn}</div>
      </Col>
    </Row>
    </>
  )
}

export default GameBoard

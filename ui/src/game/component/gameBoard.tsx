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
    const newTurnData = {
      mana : Math.floor(turn / 2) + 1,
      playActionList : [],
      cardList1 : props.user.id === props.game.userId1? props.game.cardList1 : props.game.cardList2,
      cardList2 : props.user.id === props.game.userId1? props.game.cardList2 : props.game.cardList1,
    }
    setTurnData(newTurnData)
  }, [turn, props.user.id, props.game.userId1, props.game.cardList1, props.game.cardList2])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimestamp(getTimestamp())
    }, 100);

    return () => clearTimeout(timer)
  })

  const playCardTo3 = (gameCard : GameCardType, cardList1 : GameCardType[]) => {
    gameCard.position = 3
    gameCard.play = 1
    const newTurnData = {
      playActionList : turnData.playActionList.concat([[gameCard.id, 3]]),
      mana : turnData.mana - gameCard.mana,
      cardList1 : cardList1,
      cardList2 : turnData.cardList2.concat([]),
    }
    setTurnData(newTurnData)
  }



  const playAttack = (
    gameCard : GameCardType,
    cardList1 : GameCardType[],
    gameCard2 : GameCardType,
    cardList2 : GameCardType[]
  ) => {
    gameCard.play = 1
    if (gameCard2.life > gameCard.attack){
      gameCard.exp += gameCard.attack * 5
      gameCard2.exp += gameCard.attack
      gameCard2.life = gameCard2.life - gameCard.attack
    } else {
      gameCard.exp += gameCard2.life * 10
      gameCard2.exp += gameCard2.life
      gameCard2.life = 0
      gameCard2.position = 4
    }
    if (gameCard.life > gameCard2.attack){
      gameCard2.exp += gameCard2.attack * 2
      gameCard.exp += gameCard2.attack
      gameCard.life = gameCard.life - gameCard2.attack
    } else {
      gameCard2.exp += gameCard.life * 4
      gameCard.exp += gameCard.life
      gameCard.life = 0
      gameCard.position = 4
    }
    const newTurnData = {
      playActionList : turnData.playActionList.concat([[gameCard.id, gameCard2.id]]),
      mana : turnData.mana,
      cardList1 : cardList1,
      cardList2 : cardList2,
    }
    setTurnData(newTurnData)
  }

  const playRandomly = () => {
    const cardList1 = turnData.cardList1.map((_gameCard : GameCardType) => {
      return {
        ..._gameCard
      } as GameCardType
    })
    if (cardList1.filter(card => card.position === 3).length < 8){
      for (let i = 0; i < cardList1.length; i++){
        const gameCard = cardList1[i]
        if (gameCard.position === 1 && gameCard.mana <= turnData.mana && gameCard.play === 0){
          console.log("play " + gameCard.id)
          playCardTo3(gameCard, cardList1)
          return 1
        }
      }
    }
    const cardList2 = turnData.cardList2.map((_gameCard : GameCardType) => {
      return {
        ..._gameCard
      } as GameCardType
    })
    for (let i = 0; i < cardList1.length; i++){
      const gameCard = cardList1[i]
      if (gameCard.position === 3 && gameCard.play === 0){
        for (let j = 0; j < cardList2.length; j++){
          const gameCard2 = cardList2[j]
          if (gameCard2.position === 3){
            console.log("attack ", gameCard.id, gameCard2.id)
            playAttack(gameCard, cardList1, gameCard2, cardList2)
            return 1
          }
        }
      }
    }
    return 0
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
        exp={gameCard.exp + gameCard.expWin}
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
    </div>
  )
}

export default GameBoard

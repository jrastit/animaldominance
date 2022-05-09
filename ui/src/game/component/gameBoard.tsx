import { useEffect, useState } from 'react'
import { GameType, GameCardType, TurnDataType } from '../../type/gameType'
import { CardType } from '../../type/cardType'
import { UserType } from '../../type/userType'

import GameCardWidget from './gameCardWidget'
import UserGameWidget from './userGameWidget'
import DropHelper from '../../component/dropHelper'

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
  playCardTo3,
  playAttack,
  playAttackOponent,
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

  const displayGameCardList = (
    gameCardList : GameCardType[],
    draggable ?: boolean ,
    onDrop ?: (data : string, gameCard : GameCardType
    ) => void) => {
    return (
      <Row>
      {gameCardList.map((_card, id) => {
        return (
          <Col key={id}>
            <GameCardWidget
              cardList={props.cardList}
              gameCard={_card}
              draggable={draggable ?
                (_card.position === 1 && _card.mana <= turnData.mana) ||
                (_card.position === 3 && _card.play === 0)
              :
                false}
              onDrop={onDrop}
            />
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

  const _playCardTo3 = (data : string) => {
    const cardList1 = turnData.cardList1.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard = cardList1.filter(_gameCard => {
      return _gameCard.id.toString() === data
    })[0]
    if (_gameCard.position === 1){
      playCardTo3(_gameCard, cardList1, turnData, setTurnData)
    }
  }

  const _playAttack = (data : string, gameCard2 : GameCardType) => {
    const cardList1 = turnData.cardList1.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard = cardList1.filter(_gameCard => {
      return _gameCard.id.toString() === data
    })[0]
    const cardList2 = turnData.cardList2.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard2 = cardList2.filter(_gameCard2 => {
      return _gameCard2.id === gameCard2.id
    })[0]
    playAttack(
      _gameCard,
      cardList1,
      _gameCard2,
      cardList2,
      turnData,
      setTurnData
    )
  }

  const _playAttackOponent = (data : string) => {
    const cardList1 = turnData.cardList1.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard = cardList1.filter(_gameCard => {
      return _gameCard.id.toString() === data
    })[0]
    playAttackOponent(
      _gameCard,
      cardList1,
      turnData.life2,
      turnData,
      setTurnData
    )
  }

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
        <DropHelper onDrop={_playAttackOponent}>
          {displayUser(props.oponent, turnData.life2)}
        </DropHelper>
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
      ),
      false,
      _playAttack,
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
    <Row
    style={{height : "20em", backgroundColor:"black", padding:"1em"}}
    ><DropHelper onDrop={_playCardTo3}>
    {displayGameCardList(
      turnData.cardList1.filter(
        _gameCard => _gameCard.position === 3
      ),
      !!myTurn
    )}
    </DropHelper></Row>
    <Row  style={{height : "20em", backgroundColor:"grey", padding:"1em"}}>
      <Col xs={6}>
      {displayGameCardList(
        turnData.cardList1.filter(
          _gameCard => _gameCard.position === 1
        ),
        !!myTurn && turnData.cardList1.filter(card => card.position === 3).length < 8,
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

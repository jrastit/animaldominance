import { useEffect, useState, useRef} from 'react'
import { GameType, GameCardType, TurnDataType } from '../../type/gameType'
import { CardType } from '../../type/cardType'
import { UserType } from '../../type/userType'

import GameTimer from './gameTimer'
import GameCardWidget from './gameCardWidget'
import UserGameWidget from './userGameWidget'
import DropHelper from '../../component/dropHelper'
import PlaceHelper, {PlaceRefType} from '../../component/placeHelper'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

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

  const displayUser = (
    pos : number,
    user : UserType,
    life : number
  ) => {
    const card = props.cardList.filter((card) => card.id === 1)[0]
    const level = getLevel(user.rank)
    return (
      <PlaceHelper ref={el => cardRefList.current[getRefId(pos, 255)] = el}>
      <UserGameWidget
        userName={"#" + user.id}
        family={card.family}
        name={card.name}
        mana={turnData.mana}
        level={level}
        attack={0}
        life={life}
      />
      </PlaceHelper>
    )
  }

  const cardRefList = useRef<(PlaceRefType | null)[]>([])
  const cardRefIdList = [] as number[][]
  let cardRefIdx = -1

  const getRefId = (pos : number, gameCardId : number) => {
    if (!cardRefIdList[pos]){
      cardRefIdList[pos] = []
    }
    cardRefIdx++
    cardRefIdList[pos][gameCardId] = cardRefIdx
    return cardRefIdx
  }

  const annimatePlay  = async (gameCardId1 : number, gameCardId2 ?: number) => {
    const place1 = cardRefList.current[cardRefIdList[0][gameCardId1]]?.getPlace()

    if (place1){
      if (gameCardId2){
        const place2 = cardRefList.current[cardRefIdList[1][gameCardId2]]?.getPlace()
        if (place2){
          await cardRefList.current[cardRefIdList[0][gameCardId1]]?.doTranslate2({
            x : place2.x - place1.x,
            y : place2.y - place1.y,
          })
        }
      } else {
        await cardRefList.current[cardRefIdList[0][gameCardId1]]?.doTranslate({
          x : 0,
          y : -200,
        })
      }
    }
  }

  const displayGameCardList = (
    pos : number,
    gameCardList : GameCardType[],
    draggable ?: boolean ,
    onDrop ?: (data : string, gameCard : GameCardType
    ) => void) => {
    return (
      <Row>
      {gameCardList.map((_card) => {
        return (
          <Col key={_card.id}>
            <PlaceHelper ref={el => cardRefList.current[getRefId(pos, _card.id)] = el}>
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
            </PlaceHelper>
          </Col>
        )
      })}
      </Row>
    )
  }

  const _playCardTo3 = async (data : string) => {
    const cardList1 = turnData.cardList1.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard = cardList1.filter(_gameCard => {
      return _gameCard.id.toString() === data
    })[0]
    if (_gameCard.position === 1){
      await annimatePlay(_gameCard.id)
      playCardTo3(_gameCard, cardList1, turnData, setTurnData)
    }
  }

  const _playAttack = async (data : string, gameCard2 : GameCardType) => {
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
    await annimatePlay(_gameCard.id, _gameCard2.id)
    playAttack(
      _gameCard,
      cardList1,
      _gameCard2,
      cardList2,
      turnData,
      setTurnData
    )

  }

  const _playAttackOponent = async (data : string) => {
    const cardList1 = turnData.cardList1.map(_gameCard => {
      return {..._gameCard}
    })
    const _gameCard = cardList1.filter(_gameCard => {
      return _gameCard.id.toString() === data
    })[0]
    await annimatePlay(_gameCard.id, 255)
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
          1,
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 1
          )
        )}
      </Col>
      <Col xs={2} style={{backgroundColor:"gold"}}>
        <DropHelper onDrop={_playAttackOponent}>
          {displayUser(1, props.oponent, turnData.life2)}
        </DropHelper>
      </Col>
      <Col xs={4}>
        {displayGameCardList(
          1,
          turnData.cardList2.filter(
            _gameCard => _gameCard.position === 2
          )
        )}
      </Col>
    </Row>
    <Row  style={{height : "20em", backgroundColor:"black", padding:"1em"}}>
    {displayGameCardList(
      1,
      turnData.cardList2.filter(
        _gameCard => _gameCard.position === 3
      ),
      false,
      _playAttack,
    )}
    </Row>
    <GameTimer
      myTurn={myTurn}
      latestTime={props.game.latestTime}
      endGameByTime={props.endGameByTime}
    />
    <div>

    </div>
    <Row
    style={{height : "20em", backgroundColor:"black", padding:"1em"}}
    ><DropHelper onDrop={_playCardTo3}>
    {displayGameCardList(
      0,
      turnData.cardList1.filter(
        _gameCard => _gameCard.position === 3
      ),
      !!myTurn
    )}
    </DropHelper></Row>
    <Row  style={{height : "20em", backgroundColor:"grey", padding:"1em"}}>
      <Col xs={6}>
      {displayGameCardList(
        0,
        turnData.cardList1.filter(
          _gameCard => _gameCard.position === 1
        ),
        !!myTurn && turnData.cardList1.filter(card => card.position === 3).length < 8,
      )}
      </Col>
      <Col xs={2} style={{backgroundColor:"gold"}}>
      {displayUser(0, props.user, turnData.life1)}
      </Col>
      <Col xs={3}>
        {displayGameCardList(
          0,
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

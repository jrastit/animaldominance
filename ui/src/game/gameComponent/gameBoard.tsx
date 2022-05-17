import { useEffect, useState, useRef } from 'react'
import { GameType, GameCardType, TurnDataType } from '../../type/gameType'
import { CardType } from '../../type/cardType'
import { UserType } from '../../type/userType'

import GameTimer from './gameTimer'
import GameCardWidget from './gameCardWidget'
import UserGameWidget from './userGameWidget'
import DropHelper from '../../component/dropHelper'
import PlaceHelper, { PlaceRefType } from '../../component/placeHelper'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from '../../component/buttonNice'

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
  checkTurnData,
} from '../../game/playGame'

enum Play {
  Init,
  MyTurn,
  Replay,
  Playing,
  Ready,
  Loading,
}

const annimatePlay = async (
  myTurn: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  gameCardId1: number,
  gameCardId2?: number
) => {
  //console.log(gameCardId1, current, cardRefIdList[1 - myTurn])
  const place1 = current[cardRefIdList[1 - myTurn][gameCardId1]]?.getPlace()
  //console.log(place1)
  if (place1) {
    if (gameCardId2) {
      const place2 = current[cardRefIdList[myTurn][gameCardId2]]?.getPlace()
      if (place2) {
        await current[cardRefIdList[1 - myTurn][gameCardId1]]?.doTranslate2({
          x: place2.x - place1.x,
          y: place2.y - place1.y,
        })
      }
    } else {
      await current[cardRefIdList[1 - myTurn][gameCardId1]]?.doTranslate({
        x: 0,
        y: myTurn ? -220 : 220,
      })
    }
  }
}

const _playAction = async (
  myTurn: number,
  data: number[],
  turnData : TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
) => {

  if (data[2]) {
    const gameCard = turnData.cardList[1 - myTurn].filter(_gameCard => {
      return _gameCard.id === data[0]
    })[0]
    if (gameCard.position === 1 && data[1] === 3) {
      await annimatePlay(
        myTurn,
        cardRefIdList,
        current,
        gameCard.id
      )
      playCardTo3(
        myTurn,
        gameCard.id,
        turnData,
        setTurnData
      )
    } else if (gameCard.position === 3) {
      if (data[1] === 255) {
        await annimatePlay(
          myTurn,
          cardRefIdList,
          current,
          gameCard.id,
          255
        )
        playAttackOponent(
          myTurn,
          gameCard.id,
          turnData,
          setTurnData
        )
      } else {
        const gameCardId2 = data[1]
        await annimatePlay(
          myTurn,
          cardRefIdList,
          current,
          gameCard.id,
          gameCardId2
        )
        playAttack(
          myTurn,
          gameCard.id,
          gameCardId2,
          turnData,
          setTurnData
        )
      }
    } else {
      throw Error('invalid card' + gameCard.toString())
    }
  } else {
    setTurnData({
      turn: turnData.turn,
      mana: turnData.mana,
      playActionList: turnData.playActionList.concat([data[0], data[1]]),
      cardList: turnData.cardList,
      life: turnData.life,
    })
  }
}

const _playNextAction = async (
  turn : number,
  turnData : TurnDataType,
  myTurn : number,
  setTurnData: (turnData: TurnDataType) => void,
  setPlay : (play : number) => void,
  game : GameType,
  playActionList: number[][][],
  userId : number,
  cardRefIdList: number[][],
  current: (PlaceRefType| null)[] ,
  check: (val1 : number, val2 : number, message : string) => boolean
) => {
  if (turn > turnData.turn && (myTurn || turn === turnData.turn + 2)) {
    if (
      playActionList[turnData.turn] &&
      playActionList[turnData.turn][turnData.playActionList.length]
    ){
      await _playAction(
        0,
        playActionList[turnData.turn][turnData.playActionList.length],
        turnData,
        setTurnData,
        cardRefIdList,
        current,
      )
      setPlay(Play.Replay)
    } else {
      checkTurnData(game, userId, turnData, check)
      setTurnData(getTurnData(game, userId))
      setPlay(Play.Ready)
    }
  } else {
    checkTurnData(game, userId, turnData, check)
    setTurnData(getTurnData(game, userId))
    setPlay(Play.Ready)
  }
}

const GameBoard = (props: {
  user: UserType,
  oponent: UserType,
  game: GameType,
  cardList: CardType[],
  playActionList: number[][][]
  children: any,
  endGameByTime: () => void,
  endTurn: (action: number[][], cardNextId0: number, cardNextId1 : number, turn: number) => void,
  isRefresh: boolean,
}) => {

  const [turnData, setTurnData] = useState<TurnDataType>({
    turn: 0,
    mana: 0,
    playActionList: [],
    cardList: [[], []],
    life: [],
  })

  const [play, setPlay] = useState(Play.Init)

  const turn = props.game.turn
  const myTurn = isMyTurn(turn, props.game.userId1, props.user.id)

  const cardRefList = useRef<(PlaceRefType | null)[]>([])
  const cardRefIdList = [] as number[][]
  let cardRefIdx = -1

  const getRefId = (pos: number, gameCardId: number) => {
    if (!cardRefIdList[pos]) {
      cardRefIdList[pos] = []
    }
    cardRefIdx++
    cardRefIdList[pos][gameCardId] = cardRefIdx
    return cardRefIdx
  }

  const check = (val1 : number, val2 : number, message : string) => {
    if (val1 !== val2) console.error(message)
    return val1 === val2
  }

  useEffect(() => {
    if (play === Play.Init) {
      setTurnData(getTurnData(props.game, props.user.id))
      setPlay(Play.Ready)
    }
    if (play === Play.Replay) {
      setPlay(Play.Playing)
      _playNextAction(
        turn,
        turnData,
        myTurn,
        setTurnData,
        setPlay,
        props.game,
        props.playActionList,
        props.user.id,
        cardRefIdList,
        cardRefList.current,
        check,
      )
    }
    if (play === Play.Ready) {
      if (turnData.turn < turn) {
        if (!myTurn && turnData.turn !== turn - 2){
          setTurnData(getTurnData(props.game, props.user.id))
        } else {
          setPlay(Play.Loading)
          setTimeout(async () => {
            setPlay(Play.Replay)
          }, 1000)
        }
      }
    }
  }, [
    play,
    props.game,
    props.user.id,
    props.playActionList,
    turn,
    turnData,
    myTurn,
    cardRefIdList
  ])

  const displayUser = (
    pos: number,
    user: UserType,
    life: number
  ) => {
    const card = props.cardList.filter((card) => card.id === 1)[0]
    const level = getLevel(user.rank)
    const family = card ? card.family : 0
    const name = card ? card.name : 'Player'
    return (
      <PlaceHelper ref={el => cardRefList.current[getRefId(pos, 255)] = el}>
        <UserGameWidget
          userName={"#" + user.id}
          family={family}
          name={name}
          mana={turnData.mana}
          level={level}
          attack={0}
          life={life}
        />
      </PlaceHelper>
    )
  }

  const displayGameCardList = (
    pos: number,
    gameCardList: GameCardType[],
    draggable?: boolean,
    onDrop?: (data: string, gameCard: GameCardType
    ) => void) => {
    return (
      <Row>
        {gameCardList.map((_card) => {
          return (
            <Col key={_card.id} style={{ paddingTop: '1em' }}>
              <PlaceHelper ref={el => {
                if (el) {
                  cardRefList.current[getRefId(pos, _card.id)] = el
                }
              }}>
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

  const _playCardTo3 = async (data: string) => {
    const gameCardId = parseInt(data)
    await annimatePlay(
        myTurn,
        cardRefIdList,
        cardRefList.current,
        gameCardId,
    )
    playCardTo3(
      myTurn,
      gameCardId,
      turnData,
      setTurnData
    )
  }

  const _playAttack = async (data: string, gameCard2: GameCardType) => {
    const gameCardId1 = parseInt(data)
    const gameCardId2 = gameCard2.id
    await annimatePlay(
      myTurn,
      cardRefIdList,
      cardRefList.current,
      gameCardId1,
      gameCardId2,
    )
    playAttack(
      myTurn,
      gameCardId1,
      gameCardId2,
      turnData,
      setTurnData
    )
  }

  const _playAttackOponent = async (data: string) => {
    const gameCardId = parseInt(data)
    await annimatePlay(
      myTurn,
      cardRefIdList,
      cardRefList.current,
      gameCardId,
      255,
    )
    playAttackOponent(
      myTurn,
      gameCardId,
      turnData,
      setTurnData
    )
  }

  return (
    <div style={{ fontSize: "11px" }}>
      <Row style={{ height: "20em" }}>
        <Col xs={6}>
          {displayGameCardList(
            1,
            turnData.cardList[1].filter(
              _gameCard => _gameCard.position === 1
            )
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          borderRadius: '5em',
          paddingTop : '1em',
        }}>
          <DropHelper onDrop={_playAttackOponent}>
            {displayUser(1, props.oponent, turnData.life[1])}
          </DropHelper>
        </Col>
        <Col xs={2}>
          {displayGameCardList(
            1,
            turnData.cardList[1].filter(
              _gameCard => _gameCard.position === 2
            )
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80' ,
          paddingTop : '1em',
        }}>
        </Col>
      </Row>
      <Row style={{ height: "20em", backgroundColor: "#00000080" }}>
        {displayGameCardList(
          1,
          turnData.cardList[1].filter(
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
        style={{ height: "20em", backgroundColor: "#00000080" }}
      ><DropHelper onDrop={_playCardTo3}>
          {displayGameCardList(
            0,
            turnData.cardList[0].filter(
              _gameCard => _gameCard.position === 3
            ),
            !!myTurn && play === Play.Ready
          )}
        </DropHelper></Row>
      <Row style={{ height: "20em" }}>
        <Col xs={6}>
          {displayGameCardList(
            0,
            turnData.cardList[0].filter(
              _gameCard => _gameCard.position === 1
            ),
            !!myTurn &&
            play === Play.Ready &&
            turnData.cardList[0].filter(card => card.position === 3).length < 8,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          borderRadius: '5em',
          paddingTop : '1em',
        }}>
          {displayUser(0, props.user, turnData.life[0])}
        </Col>
        <Col xs={2}>
          {displayGameCardList(
            0,
            turnData.cardList[0].filter(
              _gameCard => _gameCard.position === 2
            )
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80' ,
          paddingTop : '1em',
        }}>
          <div style={{height:'10em', textAlign:'center'}}>
          {!!myTurn && !props.isRefresh &&
            <div>
              <div style={{height:'4em'}}>
              { play === Play.Ready &&
                playRandomly(myTurn, turnData, true) === 1 &&
                <Button
                onClick={() => {
                  const data = playRandomly(myTurn, turnData)
                  if (Array.isArray(data)){
                    _playAction(
                      myTurn,
                      data,
                      turnData,
                      setTurnData,
                      cardRefIdList,
                      cardRefList.current
                    )
                  }
                }}
                >Play randomly</Button>
              }
              </div>
              {play === Play.Ready &&
                <Button
                onClick={() => {
                  props.endTurn(
                    turnData.playActionList,
                    turnData.cardList[0].length,
                    turnData.cardList[1].length,
                    turn
                  )
                }}
                >End turn</Button>
              }
            </div>

          }
          </div>
          <div style={{height:'4em', textAlign:'center'}}>
          <div>Game : {props.game.id} Turn : {turnData.turn}</div>
          <div>{Play[play]}</div>
          </div>
          <div style={{textAlign:'center'}}>
          {props.children}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default GameBoard

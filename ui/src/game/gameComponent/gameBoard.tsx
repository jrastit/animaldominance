import { ContractPlayGame } from '../../contract/solidity/compiled/contractAutoFactory'
import { useEffect, useState, useRef, ReactElement } from 'react'
import {
  GameType,
  GameCardType,
  TurnDataType,
  GameActionType,
  GameActionListType,
  GameActionPayloadType,
  ActionType,
} from '../../type/gameType'
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
  endTurnData,
  getTurnData,
  playRandomly,
  playCardTo3,
  playAttack,
  playAttackOponent,
  checkTurnData,
  playAction,
} from '../../game/playGame'

import {
  addPlayAction,
} from '../../reducer/gameSlice'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  StepId,
  setError,
} from '../../reducer/contractSlice'

import {
  endTurn,
  endGameByTime,
} from '../../game/game'


enum Play {
  Init,
  MyTurn,
  EndTurn,
  Replay,
  Playing,
  Ready,
  Loading,
}

const stepId = StepId.Game

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
    if (gameCardId2 !== undefined) {
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
  gameContract: ContractPlayGame,
  gameAction: GameActionType,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  annimate?: {
    cardRefIdList: number[][],
    current: (PlaceRefType | null)[],
    annimatePlay: (
      myTurn: number,
      cardRefIdList: number[][],
      current: (PlaceRefType | null)[],
      gameCardId1: number,
      gameCardId2?: number
    ) => Promise<void>
  }
) => {
  gameContract && await playAction(
    gameContract,
    gameAction,
    turnData,
    setTurnData,
    annimate,
  )
}

const _playNextAction = async (
  gameContract: ContractPlayGame,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  setPlay: (play: number) => void,
  game: GameType,
  playActionList: GameActionListType[],
  userId: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  check: (val1: number, val2: number, message: string) => boolean
) => {
  const playActionTurnList = playActionList[turnData.turn - 1]
  console.log("playNextAction", playActionTurnList && playActionTurnList[turnData.playActionList.length])
  if (
    playActionTurnList &&
    playActionTurnList[turnData.playActionList.length] &&
    playActionTurnList[turnData.playActionList.length] != null
  ) {
    const gameAction = playActionTurnList[turnData.playActionList.length] as GameActionType
    await _playAction(
      gameContract,
      gameAction,
      turnData,
      setTurnData,
      {
        cardRefIdList,
        current,
        annimatePlay,
      }

    )
    setPlay(Play.Replay)
  } else {
    if (playActionList.length > turnData.turn) {
      endTurnData(turnData, setTurnData)
      setPlay(Play.Replay)
    } else {
      checkTurnData(game, userId, turnData, check)
      setTurnData(getTurnData(game, userId))
      setPlay(Play.Ready)
    }
  }
}

const GameBoard = (props: {
  gameContract: ContractPlayGame,
  game: GameType,
  user: UserType,
  oponent: UserType,
  children?: any,
}) => {

  const playActionList = useAppSelector((state) => state.gameSlice.playActionList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  //const cardIdSpace = [[[],[],[]],[[],[],[]]] as number[][][]

  const [turnData, setTurnData] = useState<TurnDataType>({
    turn: 0,
    myTurn: 0,
    userId: [0, 0],
    mana: 0,
    playActionList: [],
    cardList: [[], []],
    life: [],
  })

  const [play, setPlay] = useState(Play.Init)

  const turn = props.game.turn

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

  const check = (val1: number, val2: number, message: string) => {
    if (val1 !== val2) console.error(message)
    return val1 === val2
  }

  const _addPlayAction = async (
    payload: GameActionPayloadType,
  ) => {
    dispatch(addPlayAction(payload))
  }

  const _endGameByTime = () => {
    endGameByTime(props.gameContract).then(() => {
    }).catch((err) => { dispatch(setError({ id: stepId, catchError: err })) })
  }

  const _endTurn = async () => {
    setPlay(Play.EndTurn)
    endTurn(
      props.gameContract,
      turnData.playActionList,
      turn,
      _addPlayAction,
    ).then(() => {
    }).catch((err) => {
      console.log(err)
      dispatch(setError({ id: stepId, catchError: err }))
    })
  }

  useEffect(() => {
    if (play === Play.Init) {
      setTurnData(getTurnData(props.game, props.user.id))
      setPlay(Play.Ready)
    }
    if (play === Play.Replay) {
      setPlay(Play.Playing)
      _playNextAction(
        props.gameContract,
        turnData,
        setTurnData,
        setPlay,
        props.game,
        playActionList,
        props.user.id,
        cardRefIdList,
        cardRefList.current,
        check,
      ).catch((err) => {
        console.log(err)
        dispatch(setError({ id: stepId, catchError: err }))
      })
    }
    if (play === Play.Ready || play === Play.EndTurn) {
      if (turnData.turn < turn) {
        setPlay(Play.Loading)
        endTurnData(turnData, setTurnData)
        setTimeout(async () => {
          setPlay(Play.Replay)
        }, 1000)
      }
    }
  }, [play, props.game, props.user.id, props.gameContract, turnData, playActionList, cardRefIdList, turn, dispatch])

  const displayUser = (
    pos: number,
    user: UserType,
    life: number
  ) => {
    const card = cardList.filter((card) => card.id === 1)[0]
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
    position: number,
    max:number,
    draggable?: boolean,
    onDrop?: (data: string, gameCard: GameCardType,) => void
  ) => {
    const xs = Math.floor(12 / max)
    const padding = Math.floor((12 - (max * xs)) / 2)
    const gameCardList = turnData.cardList[pos].filter(
      _gameCard => _gameCard.position === position
    )
    return (
      <Row>
        {padding && <Col xs={padding}></Col>}
        {gameCardList.map((_card) => {
          return (
            <Col xs={xs} key={_card.id} style={{ paddingTop: '1em' }}>
              <PlaceHelper ref={el => {
                if (el) {
                  cardRefList.current[getRefId(pos, _card.id)] = el
                }
              }}>
                <GameCardWidget
                  cardList={cardList}
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
      turnData.myTurn,
      cardRefIdList,
      cardRefList.current,
      gameCardId,
    )
    playCardTo3(
      gameCardId,
      turnData,
      setTurnData
    )
  }

  const _playAttack = async (data: string, gameCard2: GameCardType) => {
    const gameCardId1 = parseInt(data)
    const gameCardId2 = gameCard2.id
    await annimatePlay(
      turnData.myTurn,
      cardRefIdList,
      cardRefList.current,
      gameCardId1,
      gameCardId2,
    )
    playAttack(
      gameCardId1,
      gameCardId2,
      turnData,
      setTurnData
    )
  }

  const _playAttackOponent = async (data: string) => {
    const gameCardId = parseInt(data)
    await annimatePlay(
      turnData.myTurn,
      cardRefIdList,
      cardRefList.current,
      gameCardId,
      255,
    )
    playAttackOponent(
      gameCardId,
      turnData,
      setTurnData
    )
  }

  const _displayAction = () => {
    const _actionList = [] as ReactElement[]
    for (let _turn = playActionList.length; _turn > 0; _turn--) {
      const _playActionTurnList = playActionList[_turn - 1]
      for (let _id = _playActionTurnList.length - 1; _id >= 0 ; _id--) {
        const _playAction = _playActionTurnList[_id]
        if (_playAction) {
          const pos = 1 - (_turn % 2)
          const gameCard = turnData.cardList[pos][_playAction.gameCardId]
          let name
          let _style
          if (_id === 0){
            _style={borderBottom : 'thin solid black'}
          }
          if (gameCard) {
            name = cardList[gameCard.cardId - 1]?.name
            _actionList.push(
              <div style={_style} key={_turn + ' ' + _id}>
                {_turn} {ActionType[_playAction.actionTypeId]} {name.substring(0, 12)}
              </div>
            )
          } else {
            _actionList.push(
              <div style={_style} key={_turn + ' ' + _id}>{_turn} Loading...</div>
            )
          }
        }
      }
    }

    return (
      <Row>
        <Col>
          {_actionList.slice(0, 12)}
        </Col>
        <Col>
          {_actionList.slice(12, 24)}
        </Col>
      </Row>
    )
  }

  return (
    <div style={{ fontSize: "11px" }}>
      <Row style={{ height: "20em" }}>
        <Col xs={6}>
          {displayGameCardList(
            1,
            1,
            6,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          borderRadius: '5em',
          paddingTop: '1em',
        }}>
          <DropHelper onDrop={_playAttackOponent}>
            {displayUser(1, props.oponent, turnData.life[1])}
          </DropHelper>
        </Col>
        <Col xs={2}>
          {displayGameCardList(
            1,
            2,
            2,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffffD0',
          paddingTop: '1em',
        }}>
          {_displayAction()}
        </Col>
      </Row>
      <Row style={{ height: "20em", backgroundColor: "#00000080" }}>
        {displayGameCardList(
          1,
          3,
          8,
          false,
          _playAttack,
        )}
      </Row>
      <GameTimer
        myTurn={turnData.myTurn}
        latestTime={props.game.latestTime}
        endGameByTime={_endGameByTime}
      />
      <div>

      </div>
      <Row
        style={{ height: "20em", backgroundColor: "#00000080" }}
      ><DropHelper onDrop={_playCardTo3}>
          {displayGameCardList(
            0,
            3,
            8,
            !!turnData.myTurn && play === Play.Ready
          )}
        </DropHelper></Row>
      <Row style={{ height: "20em" }}>
        <Col xs={6}>
          {displayGameCardList(
            0,
            1,
            6,
            !!turnData.myTurn &&
            play === Play.Ready &&
            turnData.cardList[0].filter(card => card.position === 3).length < 8,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          borderRadius: '5em',
          paddingTop: '1em',
        }}>
          {displayUser(0, props.user, turnData.life[0])}
        </Col>
        <Col xs={2}>
          {displayGameCardList(
            0,
            2,
            2,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          paddingTop: '1em',
        }}>
          <div style={{ height: '10em', textAlign: 'center' }}>
            {!!turnData.myTurn &&
              <div>
                <div style={{ height: '4em' }}>
                  {play === Play.Ready &&
                    playRandomly(turnData, true) === 1 &&
                    <Button
                      onClick={() => {
                        const gameAction = playRandomly(turnData)
                        if (gameAction !== 0 && gameAction !== 1) {
                          _playAction(
                            props.gameContract,
                            gameAction,
                            turnData,
                            setTurnData,
                            {
                              cardRefIdList,
                              current: cardRefList.current,
                              annimatePlay,
                            }

                          )
                        }
                      }}
                    >Play randomly</Button>
                  }
                </div>
                {play === Play.Ready &&
                  <Button
                    onClick={() => {
                      _endTurn()
                    }}
                  >End turn</Button>
                }
              </div>

            }
          </div>
          <div style={{ height: '4em', textAlign: 'center' }}>
            <div>Game : {props.game.id} Turn : {turnData.turn}</div>
            <div>{Play[play]}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {props.children}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default GameBoard

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
  playAction,
} from '../../game/playGame'

import {
  endTurnData,
  getTurnData,
  checkTurnData,
} from '../../game/turnData'

import {
  playRandomly,
} from '../../game/gameBot'

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
  AutoPlay,
}

const stepId = StepId.Game

const annimatePlay = async (
  myTurn: number,
  cardRefIdList: number[][],
  current: (PlaceRefType | null)[],
  actionId : number,
  gameCardId1: number,
  gameCardId2: number,
) => {
  //console.log(gameCardId1, current, cardRefIdList[1 - myTurn])
  console.log(actionId, gameCardId1, gameCardId2)
  if (!gameCardId2) console.error('error!')
  const place1 = current[cardRefIdList[1 - myTurn][gameCardId1]]?.getPlace()
  //console.log(place1)
  if (place1) {
    if (gameCardId2 !== undefined) {
      let place2 = undefined
      if (actionId === ActionType.Attack){
        place2 = current[cardRefIdList[myTurn][gameCardId2]]?.getPlace()
        if (place2) {
          await current[cardRefIdList[1 - myTurn][gameCardId1]]?.doTranslate2({
            x: place2.x - place1.x,
            y: place2.y - place1.y,
          })
        }
      } else if (actionId === ActionType.Play){
        place2 = current[cardRefIdList[1 - myTurn][gameCardId2]]?.getPlace()
        if (place2) {
          await current[cardRefIdList[1 - myTurn][gameCardId1]]?.doTranslate({
            x: place2.x - place1.x,
            y: place2.y - place1.y,
          })
        }
      }
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
      actionId: number,
      gameCardId1: number,
      gameCardId2: number
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

  const [ autoPlay, setAutoPlay] = useState(false)

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
    if ((play === Play.Ready || play === Play.EndTurn) && turnData.turn < turn) {
      setPlay(Play.Loading)
      endTurnData(turnData, setTurnData)
      setTimeout(async () => {
        setPlay(Play.Replay)
      }, 1000)
    }
    if (play === Play.Ready && turnData.turn === turn && autoPlay && turnData.myTurn) {
      setPlay(Play.Loading)
      setTimeout(async () => {
        setPlay(Play.AutoPlay)
      }, 500)
    }
    if (play === Play.AutoPlay) {
      setPlay(Play.Loading)
      _autoPlay()
    }
  }, [play, props.game, props.user.id, props.gameContract, turnData, playActionList, cardRefIdList, turn, dispatch])

  const _autoPlay = async () => {
    if (turnData.myTurn){
      if (playRandomly(turnData, true)){
        await _playRandomly()
        setTimeout(async () => {
          setPlay(Play.AutoPlay)
        }, 500)
      } else {
        await _endTurn()
      }
    } else {
      setPlay(Play.Ready)
    }

  }

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
          mana={(pos ? !turnData.myTurn : !!turnData.myTurn) ? turnData.mana : 0}
          level={level}
          attack={0}
          life={life}
        />
      </PlaceHelper>
    )
  }

  const displayGameCardList = (
    pos: number,
    start: number,
    stop: number,
    draggable?: boolean,
    onDrop?: (data: string, gameCard: GameCardType,) => void,
    onDropEmpty?: (data: string, id: number) => void,
  ) => {
    const xs = Math.floor(12 / (stop - start))
    const padding = Math.floor((12 - ((stop - start) * xs)) / 2)
    const gameCardList = turnData.cardList[pos].slice(start, stop)
    return (
      <Row>
        {!!padding && <Col xs={padding}></Col>}
        {gameCardList.map((_card, _id) => {
          const id = start + _id
          return (
            <Col xs={xs} key={id} style={{ paddingTop: '1em' }}>
              <div style={{
                width:"12em",
                height:"18em",
                backgroundColor : '#ffffff40',
                borderRadius:"1.2em",
              }}>
              <PlaceHelper ref={el => {
                if (el) {
                  cardRefList.current[getRefId(pos, id)] = el
                }
              }} disable={!_card}>
              { !!_card &&
                <GameCardWidget
                  cardList={cardList}
                  gameCard={_card}
                  draggable={draggable ?
                    (_card.id < 6 && _card.mana <= turnData.mana) ||
                    (_card.id > 8 && _card.id < 16 && _card.play === 0)
                    :
                    false}
                  onDrop={onDrop}
                />
              }
              { !_card &&
                <DropHelper
                  onDrop={(data : string) => onDropEmpty && onDropEmpty(data, id)}
                  style={{
                    width:"12em",
                    height:"18em",
                  }}
                >
                </DropHelper>
              }
              </PlaceHelper>
              </div>
            </Col>
          )
        })}
      </Row>
    )
  }

  const _playCardTo3 = async (data: string, dest: number) => {
    const gameCardId = parseInt(data)
    const gameAction = {
      gameCardId,
      actionTypeId : ActionType.Play,
      dest,
      self : true,
    }
    await _playAction(
      props.gameContract,
      gameAction,
      turnData,
      setTurnData,
      {
        cardRefIdList,
        current : cardRefList.current,
        annimatePlay,
      }
    )
  }

  const _playAttack = async (data: string, gameCard2: GameCardType) => {
    const gameCardId1 = parseInt(data)
    const gameCardId2 = gameCard2.id
    const gameAction = {
      gameCardId : gameCardId1,
      actionTypeId : ActionType.Attack,
      dest : gameCardId2,
      self : true,
    }
    await _playAction(
      props.gameContract,
      gameAction,
      turnData,
      setTurnData,
      {
        cardRefIdList,
        current : cardRefList.current,
        annimatePlay,
      }
    )
  }

  const _playAttackOponent = async (data: string) => {
    const gameCardId = parseInt(data)
    const gameAction = {
      gameCardId,
      actionTypeId : ActionType.Attack,
      dest : 255,
      self : true,
    }
    await _playAction(
      props.gameContract,
      gameAction,
      turnData,
      setTurnData,
      {
        cardRefIdList,
        current : cardRefList.current,
        annimatePlay,
      }
    )
  }

  const _playRandomly = async () => {
    const gameAction = playRandomly(turnData)
    if (gameAction !== 0 && gameAction !== 1) {
      await _playAction(
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
  }

  const _displayAction = () => {
    const _actionList = [] as ReactElement[]
    for (let _turn = playActionList.length; _turn > 0; _turn--) {
      const _playActionTurnList = playActionList[_turn - 1]
      for (let _id = _playActionTurnList.length - 1; _id >= 0 ; _id--) {
        const _playAction = _playActionTurnList[_id]
        if (_playAction) {
          let _style
          if (_id === 0){
            _style={borderBottom : 'thin solid black'}
          }
          _actionList.push(
            <div style={_style} key={_turn + ' ' + _id}>
              {_turn} {ActionType[_playAction.actionTypeId]} {_playAction.gameCardId} {_playAction.dest}
            </div>
          )
          /*
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
                {_turn} {ActionType[_playAction.actionTypeId]} {_playAction.gameCardId}
              </div>
            )
          } else {
            _actionList.push(
              <div style={_style} key={_turn + ' ' + _id}>{_turn} Loading...</div>
            )
          }
          */
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
            0,
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
            6,
            8,
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
          8,
          16,
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
      >
          {displayGameCardList(
            0,
            8,
            16,
            !!turnData.myTurn && play === Play.Ready,
            undefined,
            _playCardTo3,
          )}
        </Row>
      <Row style={{ height: "20em" }}>
        <Col xs={6}>
          {displayGameCardList(
            0,
            0,
            6,
            !!turnData.myTurn &&
            play === Play.Ready &&
            turnData.cardList[0].filter(card => card === undefined).length > 0,
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
            6,
            8,
          )}
        </Col>
        <Col xs={2} style={{
          backgroundColor: '#ffffff80',
          paddingTop: '1em',
        }}>
          <div style={{ height: '10em', textAlign: 'center' }}>
            {
              <div>
                <div style={{ height: '4em' }}>

                    <span>
                    {!autoPlay && play === Play.Ready &&
                      playRandomly(turnData, true) === 1 &&
                      !!turnData.myTurn &&
                      (<Button
                      onClick={() => {
                        _playRandomly()
                      }}
                    >Play randomly</Button>)}&nbsp;&nbsp;
                    <Button
                      onClick={() => {
                        setAutoPlay(!autoPlay)
                      }}
                    >{autoPlay ? "Stop" : "Auto play"}</Button>
                    </span>

                </div>
                {!autoPlay && play === Play.Ready && !!turnData.myTurn &&
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

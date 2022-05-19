import ethers from 'ethers'

import { GameType, GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

import { PlaceRefType } from '../component/placeHelper'

import { getNewGameCardFromId } from '../game/game'

export const playDrawCard = async (
  gameContract: ethers.Contract,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  if (gameCardId === turnData.cardList[1 - turnData.myTurn].length) {
    const cardList = turnData.cardList[1 - turnData.myTurn].concat(
      await getNewGameCardFromId(
        gameContract,
        turnData.userId[1 - turnData.myTurn],
        gameCardId
      )
    )
    setTurnData({
      ...turnData,
      cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId,
        actionTypeId: ActionType.Draw,
      }]),
    })

  } else {
    throw Error('invalid gameCardId')
  }
}

export const playCardTo3 = (
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard = cardList.filter(_gameCard => _gameCard.id === gameCardId)[0]
  gameCard.position = 3
  gameCard.play = 1
  const newTurnData = {
    ...turnData,
    playActionList: turnData.playActionList.concat([{
      gameCardId: gameCard.id,
      actionTypeId: ActionType.Play,
      dest: 3,
    }]),
    mana: turnData.mana - gameCard.mana,
    cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
  }
  setTurnData(newTurnData)
}

export const playAttack = (
  gameCardId1: number,
  gameCardId2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList1 = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard1 = cardList1.filter(_gameCard => _gameCard.id === gameCardId1)[0]
  const cardList2 = turnData.cardList[turnData.myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard2 = cardList2.filter(_gameCard => _gameCard.id === gameCardId2)[0]

  gameCard1.play = 1
  if (gameCard2.life > gameCard1.attack) {
    gameCard1.expWin += gameCard1.attack * 5
    gameCard2.expWin += gameCard1.attack
    gameCard2.life = gameCard2.life - gameCard1.attack
  } else {
    gameCard1.expWin += gameCard2.life * 10
    gameCard2.expWin += gameCard2.life
    gameCard2.life = 0
    gameCard2.position = 4
  }
  if (gameCard1.life > gameCard2.attack) {
    gameCard2.expWin += gameCard2.attack * 2
    gameCard1.expWin += gameCard2.attack
    gameCard1.life = gameCard1.life - gameCard2.attack
  } else {
    gameCard2.expWin += gameCard1.life * 4
    gameCard1.expWin += gameCard1.life
    gameCard1.life = 0
    gameCard1.position = 4
  }
  const newTurnData = {
    ...turnData,
    playActionList: turnData.playActionList.concat([{
      gameCardId: gameCard1.id,
      actionTypeId: ActionType.Attack,
      dest: gameCard2.id,
    }]),
    cardList: turnData.myTurn ? [cardList1, cardList2] : [cardList2, cardList1],
  }
  setTurnData(newTurnData)
}

export const playAttackOponent = (
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard = cardList.filter(_gameCard => _gameCard.id === gameCardId)[0]
  let life2 = turnData.life[turnData.myTurn]
  gameCard.play = 1
  if (life2 > gameCard.attack) {
    gameCard.expWin += gameCard.attack * 5
    life2 = life2 - gameCard.attack
  } else {
    gameCard.expWin += life2 * 10
    life2 = 0
  }
  const newTurnData = {
    ...turnData,
    playActionList: turnData.playActionList.concat([{
      gameCardId: gameCard.id,
      actionTypeId: ActionType.Attack,
      dest: 255,
    }]),
    cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
    life: turnData.myTurn ? [turnData.life[1 - turnData.myTurn], life2] : [life2, turnData.life[1 - turnData.myTurn]],
  }
  setTurnData(newTurnData)
}

export const playRandomly = (
  turnData: TurnDataType,
  test?: boolean,
) => {
  if (turnData.cardList[1 - turnData.myTurn].filter(card => card.position === 3).length < 8) {
    for (let i = 0; i < turnData.cardList[1 - turnData.myTurn].length; i++) {
      const gameCard = turnData.cardList[1 - turnData.myTurn][i]
      if (gameCard.position === 1 && gameCard.mana <= turnData.mana && gameCard.play === 0) {
        if (!test) {
          return ({
            gameCardId: gameCard.id,
            actionTypeId: ActionType.Play,
            dest: 3,
            result: 1,
          } as GameActionType)
        }
        return 1
      }
    }
  }
  for (let i = 0; i < turnData.cardList[1 - turnData.myTurn].length; i++) {
    const gameCard = turnData.cardList[1 - turnData.myTurn][i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      for (let j = 0; j < turnData.cardList[turnData.myTurn].length; j++) {
        const gameCard2 = turnData.cardList[turnData.myTurn][j]
        if (gameCard2.position === 3) {
          if (!test) {
            return ({
              gameCardId: gameCard.id,
              actionTypeId: ActionType.Attack,
              dest: gameCard2.id,
              result: gameCard.attack,
            } as GameActionType)
          }
          return 1
        }
      }
    }
  }
  for (let i = 0; i < turnData.cardList[1 - turnData.myTurn].length; i++) {
    const gameCard = turnData.cardList[1 - turnData.myTurn][i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      if (!test) {
        return ({
          gameCardId: gameCard.id,
          actionTypeId: ActionType.Attack,
          dest: 255,
          result: gameCard.attack,
        } as GameActionType)
      }
      return 1
    }
  }
  return 0
}

export const playAction = async (
  gameContract: ethers.Contract,
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
  if (gameAction.result) {
    if (gameAction.actionTypeId === ActionType.Draw) {
      await playDrawCard(
        gameContract,
        gameAction.gameCardId,
        turnData,
        setTurnData,
      )
    } else {
      const gameCard = turnData.cardList[1 - turnData.myTurn].filter(_gameCard => {
        return _gameCard.id === gameAction.gameCardId
      })[0]
      if (
        gameAction.actionTypeId === ActionType.Play
      ) {
        if (gameCard.position === 1 && gameAction.dest === 3) {
          annimate && await annimate.annimatePlay(
            turnData.myTurn,
            annimate.cardRefIdList,
            annimate.current,
            gameCard.id
          )
          playCardTo3(
            gameCard.id,
            turnData,
            setTurnData
          )
        } else {
          throw Error(
            'Wrong position/dest for Play : ' +
            gameCard.position +
            '/' +
            gameAction.dest
          )
        }
      } else if (
        gameCard.position === 3 &&
        gameAction.actionTypeId === ActionType.Attack &&
        gameAction.dest !== undefined
      ) {
        if (gameAction.dest === 255) {
          annimate && await annimate.annimatePlay(
            turnData.myTurn,
            annimate.cardRefIdList,
            annimate.current,
            gameCard.id,
            255,
          )
          playAttackOponent(
            gameCard.id,
            turnData,
            setTurnData
          )
        } else {
          const gameCardId2 = gameAction.dest
          annimate && await annimate.annimatePlay(
            turnData.myTurn,
            annimate.cardRefIdList,
            annimate.current,
            gameCard.id,
            gameCardId2,
          )
          playAttack(
            gameCard.id,
            gameCardId2,
            turnData,
            setTurnData
          )
        }
      } else {
        console.error('Invalid card', gameCard)
        throw Error('invalid card' + gameCard.toString())
      }
    }
  } else {
    setTurnData({
      ...turnData,
      playActionList: turnData.playActionList.concat([gameAction]),
    })
  }
}

const checkCard = (
  card1: GameCardType,
  card2: GameCardType,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  check(card1.id, card2.id, 'check id')
  check(card1.cardId, card2.cardId, 'check cardId')
  check(card1.mana, card2.mana, 'check mana')
  check(card1.attack, card2.attack, 'check attack')
  check(card1.life, card2.life, 'check life')
  check(card1.position, card2.position, 'check position')
  check(card1.exp, card2.exp, 'check exp')
  check(card1.expWin, card2.expWin, 'check exp win')
}

export const checkTurnData = (
  game: GameType,
  userId: number,
  turnData: TurnDataType,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  const cardList1 = userId === game.userId1 ? game.cardList1 : game.cardList2
  const cardList2 = userId === game.userId1 ? game.cardList2 : game.cardList1
  const life1 = userId === game.userId1 ? game.life1 : game.life2
  const life2 = userId === game.userId1 ? game.life2 : game.life1
  /*
  console.log(
    turnData.cardList[0].length,
    cardList1.length,
    turnData.cardList[1].length,
    cardList2.length
  )
  */
  check(turnData.cardList[0].length, cardList1.length, "Check player 0 nb card")
  for (let i = 0; i < turnData.cardList[0].length; i++) {
    checkCard(turnData.cardList[0][i], cardList1[i], check)
  }
  check(turnData.cardList[1].length, cardList2.length, "Check player 1 nb card")
  for (let i = 0; i < turnData.cardList[1].length; i++) {
    checkCard(turnData.cardList[1][i], cardList2[i], check)
  }
  check(turnData.life[0], life1, "Check player life")
  check(turnData.life[1], life2, "Check player life")
  check(turnData.turn, game.turn, 'Check turn')
}

export const getTurnData = (game: GameType, userId: number) => {
  return {
    turn: game.turn,
    userId: [userId, game.userId1 === userId ? game.userId2 : game.userId1],
    myTurn: isMyTurn(game.turn, game.userId1, userId),
    mana: Math.floor((game.turn + 1) / 2),
    playActionList: [],
    drawCardList: [],
    cardList: [userId === game.userId1 ? game.cardList1 : game.cardList2, userId === game.userId1 ? game.cardList2 : game.cardList1],
    life: [userId === game.userId1 ? game.life1 : game.life2, userId === game.userId1 ? game.life2 : game.life1],
    actionId: 0,
  } as TurnDataType
}

export const endTurnData = (
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  setTurnData({
    ...turnData,
    turn: turnData.turn + 1,
    mana: (turnData.turn + 2) % 2,
    myTurn: 1 - turnData.myTurn,
    playActionList: [],
  })
}

const isMyTurn = (turn: number, userId1: number, userId: number) => {
  if (turn % 2 === 0 && userId1 === userId) {
    return 0
  }
  if (turn % 2 === 1 && userId1 !== userId) {
    return 0
  }
  return 1
}

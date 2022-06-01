import {
  GameCardType,
  GameType,
  TurnDataType,
} from '../type/gameType'

const checkCard = (
  card1: GameCardType | undefined,
  card2: GameCardType | undefined,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  check(card1 === undefined ? 1 : 0, card2 === undefined ? 1 : 0, 'check card undefined')
  if (card1 && card2) {
    check(card1.id, card2.id, 'check id')
    check(card1.cardId, card2.cardId, 'check cardId')
    check(card1.mana, card2.mana, 'check mana')
    check(card1.attack, card2.attack, 'check attack')
    check(card1.life, card2.life, 'check life')
    check(card1.exp, card2.exp, 'check exp')
    check(card1.expWin, card2.expWin, 'check exp win')
  }
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
    turnData.cardList[0].map(_card => _card ?.userCardId),
    cardList1.map(_card => _card ?.userCardId),
    turnData.cardList[1].map(_card => _card ?.userCardId),
    cardList2.map(_card => _card ?.userCardId),
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

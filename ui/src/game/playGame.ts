import { GameType, GameCardType, TurnDataType } from '../type/gameType'

export const playCardTo3 = (
  gameCard: GameCardType,
  cardList1: GameCardType[],
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  gameCard.position = 3
  gameCard.play = 1
  const newTurnData = {
    playActionList: turnData.playActionList.concat([[gameCard.id, 3]]),
    mana: turnData.mana - gameCard.mana,
    cardList1: cardList1,
    cardList2: turnData.cardList2.concat([]),
    life1: turnData.life1,
    life2: turnData.life2,
  }
  setTurnData(newTurnData)
}

export const playAttack = (
  gameCard: GameCardType,
  cardList1: GameCardType[],
  gameCard2: GameCardType,
  cardList2: GameCardType[],
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  gameCard.play = 1
  if (gameCard2.life > gameCard.attack) {
    gameCard.expWin += gameCard.attack * 5
    gameCard2.expWin += gameCard.attack
    gameCard2.life = gameCard2.life - gameCard.attack
  } else {
    gameCard.expWin += gameCard2.life * 10
    gameCard2.expWin += gameCard2.life
    gameCard2.life = 0
    gameCard2.position = 4
  }
  if (gameCard.life > gameCard2.attack) {
    gameCard2.expWin += gameCard2.attack * 2
    gameCard.expWin += gameCard2.attack
    gameCard.life = gameCard.life - gameCard2.attack
  } else {
    gameCard2.expWin += gameCard.life * 4
    gameCard.expWin += gameCard.life
    gameCard.life = 0
    gameCard.position = 4
  }
  const newTurnData = {
    playActionList: turnData.playActionList.concat([[gameCard.id, gameCard2.id]]),
    mana: turnData.mana,
    cardList1: cardList1,
    cardList2: cardList2,
    life1: turnData.life1,
    life2: turnData.life2,
  }
  setTurnData(newTurnData)
}

export const playAttackOponent = (
  gameCard: GameCardType,
  cardList1: GameCardType[],
  life2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  gameCard.play = 1
  if (life2 > gameCard.attack) {
    gameCard.expWin += gameCard.attack * 5
    life2 = life2 - gameCard.attack
  } else {
    gameCard.expWin += life2 * 10
    life2 = 0
  }
  const newTurnData = {
    playActionList: turnData.playActionList.concat([[gameCard.id, 255]]),
    mana: turnData.mana,
    cardList1: cardList1,
    cardList2: turnData.cardList2,
    life1: turnData.life1,
    life2: life2,
  }
  setTurnData(newTurnData)
}

export const playRandomly = (
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
  test?: boolean,
) => {
  const cardList1 = turnData.cardList1.concat([])
  if (cardList1.filter(card => card.position === 3).length < 8) {
    for (let i = 0; i < cardList1.length; i++) {
      const gameCard = cardList1[i]
      if (gameCard.position === 1 && gameCard.mana <= turnData.mana && gameCard.play === 0) {
        if (!test) {
          playCardTo3(gameCard, cardList1, turnData, setTurnData)
          //console.log("play " + gameCard.id)
        }
        return 1
      }
    }
  }
  const cardList2 = turnData.cardList2.map((_gameCard: GameCardType) => {
    return {
      ..._gameCard
    } as GameCardType
  })
  for (let i = 0; i < cardList1.length; i++) {
    const gameCard = cardList1[i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      for (let j = 0; j < cardList2.length; j++) {
        const gameCard2 = cardList2[j]
        if (gameCard2.position === 3) {
          if (!test) {
            //console.log("attack ", gameCard.id, gameCard2.id)
            playAttack(gameCard, cardList1, gameCard2, cardList2, turnData, setTurnData)
          }
          return 1
        }
      }
    }
  }
  for (let i = 0; i < cardList1.length; i++) {
    const gameCard = cardList1[i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      if (!test) {
        playAttackOponent(gameCard, cardList1, turnData.life2, turnData, setTurnData)
      }
      return 1
    }
  }
  return 0
}

const checkCard = (
  card1: GameCardType,
  card2: GameCardType,
  check: (val1: number, val2: number, message: string) => boolean
) => {
  check(card1.id, card2.id, 'check id')
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
  for (let i = 0; i < turnData.cardList1.length; i++) {
    checkCard(turnData.cardList1[i], cardList1[i], check)

  }
  for (let i = 0; i < turnData.cardList2.length; i++) {
    checkCard(turnData.cardList2[i], cardList2[i], check)
  }
  check(turnData.life1, life1, "player life")
  check(turnData.life2, life2, "player life")
}

export const getTurnData = (game: GameType, userId: number) => {
  return {
    mana: Math.floor(game.turn / 2) + 1,
    playActionList: [],
    cardList1: userId === game.userId1 ? game.cardList1 : game.cardList2,
    cardList2: userId === game.userId1 ? game.cardList2 : game.cardList1,
    life1: userId === game.userId1 ? game.life1 : game.life2,
    life2: userId === game.userId1 ? game.life2 : game.life1,
  } as TurnDataType
}

export const isMyTurn = (turn: number, userId1: number, userId: number) => {
  if (turn % 2 === 0 && userId1 === userId) {
    return 1
  }
  if (turn % 2 === 1 && userId1 !== userId) {
    return 1
  }
  return 0
}

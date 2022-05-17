import { GameType, GameCardType, TurnDataType } from '../type/gameType'

export const playCardTo3 = (
  myTurn: number,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard = cardList.filter(_gameCard => _gameCard.id === gameCardId)[0]
  gameCard.position = 3
  gameCard.play = 1
  const newTurnData = {
    turn: turnData.turn,
    playActionList: turnData.playActionList.concat([[gameCard.id, 3]]),
    mana: turnData.mana - gameCard.mana,
    cardList: myTurn ? [cardList, turnData.cardList[myTurn]] : [turnData.cardList[myTurn], cardList],
    life: turnData.life,
  }
  setTurnData(newTurnData)
}

export const playAttack = (
  myTurn: number,
  gameCardId1: number,
  gameCardId2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList1 = turnData.cardList[1 - myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard1 = cardList1.filter(_gameCard => _gameCard.id === gameCardId1)[0]
  const cardList2 = turnData.cardList[myTurn].map((_gameCard) => { return { ..._gameCard } })
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
    turn: turnData.turn,
    playActionList: turnData.playActionList.concat([[gameCard1.id, gameCard2.id]]),
    mana: turnData.mana,
    cardList: myTurn ? [cardList1, cardList2] : [cardList2, cardList1],
    life: turnData.life,
  }
  setTurnData(newTurnData)
}

export const playAttackOponent = (
  myTurn: number,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - myTurn].map((_gameCard) => { return { ..._gameCard } })
  const gameCard = cardList.filter(_gameCard => _gameCard.id === gameCardId)[0]
  let life2 = turnData.life[myTurn]
  gameCard.play = 1
  if (life2 > gameCard.attack) {
    gameCard.expWin += gameCard.attack * 5
    life2 = life2 - gameCard.attack
  } else {
    gameCard.expWin += life2 * 10
    life2 = 0
  }
  const newTurnData = {
    turn: turnData.turn,
    playActionList: turnData.playActionList.concat([[gameCard.id, 255]]),
    mana: turnData.mana,
    cardList: myTurn ? [cardList, turnData.cardList[myTurn]] : [turnData.cardList[myTurn], cardList],
    life: myTurn ? [turnData.life[1 - myTurn], life2] : [life2, turnData.life[1 - myTurn]],
  }
  setTurnData(newTurnData)
}

export const playRandomly = (
  myTurn: number,
  turnData: TurnDataType,
  test?: boolean,
) => {
  if (turnData.cardList[1 - myTurn].filter(card => card.position === 3).length < 8) {
    for (let i = 0; i < turnData.cardList[1 - myTurn].length; i++) {
      const gameCard = turnData.cardList[1 - myTurn][i]
      if (gameCard.position === 1 && gameCard.mana <= turnData.mana && gameCard.play === 0) {
        if (!test) {
          return ([gameCard.id, 3, 1])
        }
        return 1
      }
    }
  }
  for (let i = 0; i < turnData.cardList[1 - myTurn].length; i++) {
    const gameCard = turnData.cardList[1 - myTurn][i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      for (let j = 0; j < turnData.cardList[myTurn].length; j++) {
        const gameCard2 = turnData.cardList[myTurn][j]
        if (gameCard2.position === 3) {
          if (!test) {
            return ([gameCard.id, gameCard2.id, gameCard.attack])
          }
          return 1
        }
      }
    }
  }
  for (let i = 0; i < turnData.cardList[1 - myTurn].length; i++) {
    const gameCard = turnData.cardList[1 - myTurn][i]
    if (gameCard.position === 3 && gameCard.play === 0) {
      if (!test) {
        return ([gameCard.id, 255, gameCard.attack])
      }
      return 1
    }
  }
  return 0
}

export const playAction = async (
  myTurn: number,
  data: number[],
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {

  if (data[2]) {
    const gameCard = turnData.cardList[1 - myTurn].filter(_gameCard => {
      return _gameCard.id === data[0]
    })[0]
    if (gameCard.position === 1 && data[1] === 3) {
      playCardTo3(
        myTurn,
        gameCard.id,
        turnData,
        setTurnData
      )
    } else if (gameCard.position === 3) {
      if (data[1] === 255) {
        playAttackOponent(
          myTurn,
          gameCard.id,
          turnData,
          setTurnData
        )
      } else {
        const gameCardId2 = data[1]
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
  check(turnData.cardList[0].length, cardList1.length, "cardlist[0].length")
  for (let i = 0; i < turnData.cardList[0].length; i++) {
    checkCard(turnData.cardList[0][i], cardList1[i], check)
  }
  check(turnData.cardList[1].length, cardList2.length, "cardlist[1].length")
  for (let i = 0; i < turnData.cardList[1].length; i++) {
    checkCard(turnData.cardList[1][i], cardList2[i], check)
  }
  check(turnData.life[0], life1, "player life")
  check(turnData.life[1], life2, "player life")
}

export const getTurnData = (game: GameType, userId: number) => {
  return {
    turn: game.turn,
    mana: Math.floor((game.turn + 1) / 2),
    playActionList: [],
    cardList: [userId === game.userId1 ? game.cardList1 : game.cardList2, userId === game.userId1 ? game.cardList2 : game.cardList1],
    life: [userId === game.userId1 ? game.life1 : game.life2, userId === game.userId1 ? game.life2 : game.life1],
    actionId: 0,
  } as TurnDataType
}

export const isMyTurn = (turn: number, userId1: number, userId: number) => {
  if (turn % 2 === 0 && userId1 === userId) {
    return 0
  }
  if (turn % 2 === 1 && userId1 !== userId) {
    return 0
  }
  return 1
}

import { ContractPlayGame } from '../contract/solidity/compiled/contractAutoFactory'

import { GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

import { PlaceRefType } from '../component/placeHelper'

import { getNewGameCardFromId } from '../game/game'

export const playDrawCard = async (
  gameContract: ContractPlayGame,
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  if (turnData.cardList[1 - turnData.myTurn][gameCardId] === undefined) {
    const cardList = turnData.cardList[1 - turnData.myTurn].concat([])
    cardList[gameCardId] = await getNewGameCardFromId(
      gameContract,
      turnData.userId[1 - turnData.myTurn],
      gameCardId
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
    throw Error('invalid draw gameCardId ' + turnData.cardList[1 - turnData.myTurn][gameCardId])
  }
}

export const playCardTo3 = (
  gameCardId: number,
  gameCardId2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  if (cardList[gameCardId2] === undefined && cardList[gameCardId] !== undefined) {
    const gameCard = cardList[gameCardId] as GameCardType
    cardList[gameCardId2] = gameCard
    cardList[gameCardId] = undefined
    gameCard.id = gameCardId2
    gameCard.play = 1
    const newTurnData = {
      ...turnData,
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId,
        actionTypeId: ActionType.Play,
        dest: gameCardId2,
      }]),
      mana: turnData.mana - gameCard.mana,
      cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
    }
    setTurnData(newTurnData)
  } else {
    throw Error("Unable to play" + cardList[gameCardId] + ' => ' + cardList[gameCardId2])
  }
}

const removeCard = (cardList: (GameCardType | undefined)[], cardId: number) => {
  for (let i = 16; i < cardList.length; i++) {
    if (cardList[i] === undefined && cardList[cardId]) {
      const gameCard = cardList[cardId] as GameCardType
      cardList[i] = gameCard
      gameCard.id = i
      cardList[cardId] = undefined
      return cardList
    }
  }
  throw Error("Unable to remove card " + cardId)
}

export const playAttack = (
  gameCardId1: number,
  gameCardId2: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  let cardList1 = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  let cardList2 = turnData.cardList[turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  if (cardList1[gameCardId1] !== undefined && cardList2[gameCardId2] !== undefined) {
    const gameCard1 = cardList1[gameCardId1] as GameCardType
    const gameCard2 = cardList2[gameCardId2] as GameCardType
    gameCard1.play = 1
    if (gameCard2.life > gameCard1.attack) {
      gameCard1.expWin += gameCard1.attack * 5
      gameCard2.expWin += gameCard1.attack
      gameCard2.life = gameCard2.life - gameCard1.attack
    } else {
      gameCard1.expWin += gameCard2.life * 10
      gameCard2.expWin += gameCard2.life
      gameCard2.life = 0
      //cardList2[gameCardId2] = undefined
      cardList2 = removeCard(cardList2, gameCardId2)
    }
    if (gameCard1.life > gameCard2.attack) {
      gameCard2.expWin += gameCard2.attack * 2
      gameCard1.expWin += gameCard2.attack
      gameCard1.life = gameCard1.life - gameCard2.attack
    } else {
      gameCard2.expWin += gameCard1.life * 4
      gameCard1.expWin += gameCard1.life
      gameCard1.life = 0
      //cardList1[gameCardId1] = undefined
      cardList1 = removeCard(cardList1, gameCardId1)
    }
    const newTurnData = {
      ...turnData,
      playActionList: turnData.playActionList.concat([{
        gameCardId: gameCardId1,
        actionTypeId: ActionType.Attack,
        dest: gameCardId2,
      }]),
      cardList: turnData.myTurn ? [cardList1, cardList2] : [cardList2, cardList1],
    }
    setTurnData(newTurnData)
  } else {
    throw Error("Unable to play attack " + cardList1[gameCardId1] + ' => ' + cardList2[gameCardId2])
  }

}

export const playAttackOponent = (
  gameCardId: number,
  turnData: TurnDataType,
  setTurnData: (turnData: TurnDataType) => void,
) => {
  const cardList = turnData.cardList[1 - turnData.myTurn].map((_gameCard) => {
    if (_gameCard) return { ..._gameCard }
    return undefined
  })
  if (cardList[gameCardId]) {
    const gameCard = cardList[gameCardId] as GameCardType
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
        gameCardId: gameCardId,
        actionTypeId: ActionType.Attack,
        dest: 255,
      }]),
      cardList: turnData.myTurn ? [cardList, turnData.cardList[turnData.myTurn]] : [turnData.cardList[turnData.myTurn], cardList],
      life: turnData.myTurn ? [turnData.life[1 - turnData.myTurn], life2] : [life2, turnData.life[1 - turnData.myTurn]],
    }
    setTurnData(newTurnData)
  }

}

export const playAction = async (
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
  //console.log(turnData.turn, turnData.myTurn, gameAction)
  if (gameAction.result || gameAction.self) {
    if (gameAction.actionTypeId === ActionType.Draw) {
      await playDrawCard(
        gameContract,
        gameAction.gameCardId,
        turnData,
        setTurnData,
      )
    } else {
      const _gameCard = turnData.cardList[1 - turnData.myTurn][gameAction.gameCardId]
      //console.log(turnData.cardList[1 - turnData.myTurn])
      if (_gameCard) {
        const gameCard = _gameCard as GameCardType
        if (
          gameAction.actionTypeId === ActionType.Play && _gameCard && gameAction.dest
        ) {
          if (gameCard.id < 6 && gameAction.dest >= 8 && gameAction.dest < 16) {
            annimate && await annimate.annimatePlay(
              turnData.myTurn,
              annimate.cardRefIdList,
              annimate.current,
              gameAction.actionTypeId,
              gameCard.id,
              gameAction.dest,
            )
            playCardTo3(
              gameCard.id,
              gameAction.dest,
              turnData,
              setTurnData
            )
          } else {
            throw Error(
              'Wrong position/dest for Play : ' +
              gameCard.id +
              '/' +
              gameAction.dest
            )
          }
        } else if (
          gameCard.id >= 8 && gameCard.id < 16 &&
          gameAction.actionTypeId === ActionType.Attack &&
          gameAction.dest !== undefined
        ) {
          if (gameAction.dest === 255) {
            annimate && await annimate.annimatePlay(
              turnData.myTurn,
              annimate.cardRefIdList,
              annimate.current,
              gameAction.actionTypeId,
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
              gameAction.actionTypeId,
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
      } else {
        console.error('Undefined card')
        throw Error('Undefined card')
      }
    }
  } else {
    setTurnData({
      ...turnData,
      playActionList: turnData.playActionList.concat([gameAction]),
    })
  }
}

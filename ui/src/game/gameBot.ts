import { GameCardType, TurnDataType, GameActionType, ActionType } from '../type/gameType'

export const playRandomly = (
  turnData: TurnDataType,
  test?: boolean,
) => {
  if (turnData.cardList[1 - turnData.myTurn].filter(card => card === undefined).length > 0) {
    for (let i = 0; i < 6; i++) {
      if (turnData.cardList[1 - turnData.myTurn][i]) {
        const gameCard = turnData.cardList[1 - turnData.myTurn][i] as GameCardType
        if (gameCard.mana <= turnData.mana && gameCard.play === 0) {
          for (let j = 8; j < 16; j++) {
            if (turnData.cardList[1 - turnData.myTurn][j] === undefined) {
              if (!test) {
                return ({
                  gameCardId: gameCard.id,
                  actionTypeId: ActionType.Play,
                  dest: j,
                  result: 1,
                } as GameActionType)
              }
              return 1
            }
          }
        }
      }
    }
  }
  for (let i = 8; i < 16; i++) {
    if (turnData.cardList[1 - turnData.myTurn][i]) {
      const gameCard = turnData.cardList[1 - turnData.myTurn][i] as GameCardType
      if (gameCard.play === 0) {
        for (let j = 8; j < 16; j++) {
          if (turnData.cardList[turnData.myTurn][j]) {
            const gameCard2 = turnData.cardList[turnData.myTurn][j] as GameCardType
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
  }
  return 0
}

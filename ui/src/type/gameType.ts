export enum ActionType {
  Draw,
  Play,
  Attack,
}

export type GameActionListType = (GameActionType | null)[]

export type GameActionPayloadType = {
  turn: number,
  id: number,
  gameAction: GameActionType,
}

export type GameActionType = {
  gameCardId: number
  actionTypeId: number
  dest?: number,
  result?: number,
  self?: boolean,
}

export type TurnDataType = {
  turn: number
  mana: number
  playActionList: GameActionListType
  cardList: (GameCardType | undefined)[][]
  life: number[]
  userId: number[]
  myTurn: number
}

export type GameCardPlaceType = {
  x: number
  y: number
  heigth: number
  width: number
}

export type GameCardType = {
  id: number
  userId: number
  userCardId: number
  cardId: number
  life: number
  attack: number
  mana: number
  exp: number
  expWin: number
  play: number
}

export type GameType = {
  id: number
  userId1: number
  userId2: number
  life1: number
  life2: number
  cardList1: (GameCardType | undefined)[]
  cardList2: (GameCardType | undefined)[]
  latestTime: number
  version: number
  turn: number
  winner: number
  ended: boolean
}

export type GameListItemType = {
  id: number
  userId1: number
  userId2: number
  userDeck1: number
  userDeck2: number
  winner: number
  ended: boolean
  playGame: string | undefined
}

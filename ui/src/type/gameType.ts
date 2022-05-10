export type TurnDataType = {
  mana: number,
  playActionList: number[][],
  cardList1: GameCardType[],
  cardList2: GameCardType[],
  life1: number,
  life2: number,
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
  position: number
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
  cardList1: GameCardType[]
  cardList2: GameCardType[]
  latestTime: number
  version: number
  turn: number
  winner: number
}

export type GameListItemType = {
  id: number
  userId1: number
  userId2: number
  userDeck1: number
  userDeck2: number
  winner: number
}

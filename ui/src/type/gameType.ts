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
}

export type GameType = {
  id: number
  userId1: number
  userId2: number
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

export type GameCardType = {
  userId: number
  userCardId: number
  cardId: number
  life: number
  attack: number
  mana: number
  position: number
}

export type GameType = {
  id: number
  userId1: number
  userId2: number
  cardList1: GameCardType[]
  cardList2: GameCardType[]
}

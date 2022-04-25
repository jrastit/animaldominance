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

}

export type GameListItemType = {
  id: number
  userId1: number
  userId2: number
  userDeck1: number
  userDeck2: number
}

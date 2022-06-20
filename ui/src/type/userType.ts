import { BigNumber } from 'ethers'

export type UserType = {
  id: number
  name: string
  totem: number
  rank: number
}

export type UserDeckType = {
  id: number,
  userCardIdList: number[]
}

export type UserCardType = {
  id: number,
  cardId: number,
  exp: number,
  expWin: number,
  price: number,
  sold: boolean,
  nftId: BigNumber,
}

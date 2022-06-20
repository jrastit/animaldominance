import { BigNumber } from 'ethers'

export type TradeType = {
  userId: number
  userCardId: number
  price: BigNumber
}

export type NftType = {
  id: BigNumber
  owner: string
  cardId: number
  exp: number
}

import { BigNumber } from 'ethers'

export type TradeType = {
  userId: number,
  userCardId: number,
  price: BigNumber,
}

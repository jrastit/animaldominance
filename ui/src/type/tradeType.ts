import ethers from 'ethers'

export type TradeType = {
  userId: number,
  userCardId: number,
  price: ethers.BigNumber,
}

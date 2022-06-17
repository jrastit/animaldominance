import { BigNumber } from 'ethers'
import { ContractGameManager } from '../contract/solidity/compiled/contractAutoFactory'

export const nftCreateCard = async (
  contract: ContractGameManager,
  cardId: number,
) => {
  return await contract.createNFT(
    cardId,
  )
}

export const nftBurnCard = async (
  contract: ContractGameManager,
  nftId: BigNumber,
) => {
  return await contract.burnNFT(
    nftId,
  )
}

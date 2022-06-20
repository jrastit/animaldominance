import { BigNumber } from 'ethers'
import { ContractHandlerType } from '../type/contractType'
import { NftType } from '../type/tradeType'

export const nftCreateCard = async (
  contractHandler: ContractHandlerType,
  cardId: number,
) => {
  const tx = await contractHandler.gameManager.getContract().createNFT(
    cardId,
  )
  return tx.result.logs.map((log: any) => {
    const log2 = contractHandler.gameManager.getContract().interface.parseLog(log)
    if (log2.name === 'Transfer') {
      return log2.args.tokenId as BigNumber
    }
    return undefined
  }).filter((ret: BigNumber | undefined) => ret)[0]
}

export const nftBurnCard = async (
  contractHandler: ContractHandlerType,
  nftId: BigNumber,
) => {
  const tx = await contractHandler.gameManager.getContract().burnNFT(
    nftId,
  )
  return tx.result.logs.map((log: any) => {
    const log2 = contractHandler.gameManager.getContract().interface.parseLog(log)
    if (log2.name === 'AddUserCardWithExp') {
      return {
        cardId: log2.args._userCard.cardId,
        exp: log2.args._userCard.exp.toNumber(),
        previousOwner: log2.args._userCard.previousOwner,
      }
    }
    return undefined
  }).filter((ret: any | undefined) => ret)[0]
}

export const nftLoadHistorySelf = async (
  contractHandler: ContractHandlerType,
) => {
  const address = await contractHandler.transactionManager.getAddress()
  const historyList = (await contractHandler.nft.getContract().nftHistory(
    await contractHandler.transactionManager.signer.getAddress(),
  ))[0]
  console.log(historyList)
  return historyList.filter((history: any, index: number, self: any[]) => {
    return self.findIndex(h => h.nftId === history.nftId) === index;
  }).filter((history: any) => {
    return history.owner === address
  }).map((history: any) => {
    return {
      id: history.nftId,
      owner: history.owner,
      cardId: history.cardId,
      exp: history.exp.toNumber(),
    } as NftType
  })
}

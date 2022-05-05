import * as ethers from 'ethers'

import {
  getCardLastId
} from './card'

import {
  getContractTrading,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  TradeType
} from '../type/tradeType'

export const getTradingContract = async (
  contract: ethers.Contract,
) => {
  const tradeContractAddress = await contract.trading()
  console.log(tradeContractAddress)
  return getContractTrading(tradeContractAddress, contract.signer)
}

export const loadAllTrade = async (
  contract: ethers.Contract,
  tradingContract: ethers.Contract,
  setMessage?: (message: string | undefined) => void,
) => {
  const tradeList = [] as TradeType[][][]
  const cardLastId = await getCardLastId(contract)
  for (let i = 1; i <= cardLastId; i++) {
    tradeList[i - 1] = []
    for (let level = 0; level < 6; level++) {
      tradeList[i - 1][level] = []
      const tradeLengthChain = (await tradingContract.getCardLevelTradeLength(i, level))
      if (tradeLengthChain > 0) {
        for (let tradeId = 0; tradeId < tradeLengthChain; tradeId++) {
          const tradeChain = (await tradingContract.getTrade(i, level, tradeId))
          tradeList[i - 1][level][tradeId] = {
            userId: tradeChain.userId.toNumber(),
            userCardId: tradeChain.userCardId,
            price: tradeChain.price,
          }
        }
      }
      setMessage && setMessage('Loaded trade for card ' + i + ' level ' + level);
    }
  }
  return tradeList;
}
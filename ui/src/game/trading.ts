import { ContractGameManager } from '../contract/solidity/compiled/contractAutoFactory'
import { ContractTrading } from '../contract/solidity/compiled/contractAutoFactory'

import {
  getCardLastId
} from './card'

import {
  TradeType
} from '../type/tradeType'

export const loadAllTrade = async (
  contract: ContractGameManager,
  tradingContract: ContractTrading,
  setMessage?: (message: string | undefined) => void,
) => {
  let tradeList = [] as TradeType[][][]
  console.log(await tradingContract.getAllCardTradeLength())
  if (1) {
    const tradeListChain = (await tradingContract.getAllCardTrade())[0]
    console.log(tradeListChain)
    tradeList = tradeListChain.map(
      (tradeCardChain: any[][]) => tradeCardChain.map(
        (tradeLevelChain: any[]) => tradeLevelChain.map(
          (tradeChain) => {
            console.log(tradeChain)
            return {
              userId: tradeChain.userId.toNumber(),
              userCardId: tradeChain.userCardId,
              price: tradeChain.price,
            }
          }
        )
      )
    )
  } else {
    const cardLastId = await getCardLastId(contract)
    for (let i = 1; i <= cardLastId; i++) {
      tradeList[i - 1] = []
      for (let level = 0; level < 6; level++) {
        tradeList[i - 1][level] = []
        const tradeLengthChain = (await tradingContract.getCardLevelTradeLength(i, level))
        if (tradeLengthChain > 0) {
          for (let tradeId = 0; tradeId < tradeLengthChain; tradeId++) {
            const tradeChain = (await tradingContract.getTrade(i, level, tradeId))[0]
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
  }
  return tradeList;
}

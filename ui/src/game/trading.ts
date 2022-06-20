import { ContractHandlerType } from '../type/contractType'

import {
  getCardLastId
} from './card'

import {
  TradeType
} from '../type/tradeType'

export const loadAllTrade = async (
  contractHandler: ContractHandlerType,
  setMessage?: (message: string | undefined) => void,
) => {
  let tradeList = [] as TradeType[][][]
  if (1) {
    const tradeListChain = (await contractHandler.trading.getContract().getAllCardTrade())[0]
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
    const cardLastId = await getCardLastId(contractHandler)
    for (let i = 1; i <= cardLastId; i++) {
      tradeList[i - 1] = []
      for (let level = 0; level < 6; level++) {
        tradeList[i - 1][level] = []
        const tradeLengthChain = (await contractHandler.trading.getContract().getCardLevelTradeLength(i, level))
        if (tradeLengthChain > 0) {
          for (let tradeId = 0; tradeId < tradeLengthChain; tradeId++) {
            const tradeChain = (await contractHandler.trading.getContract().getTrade(i, level, tradeId))[0]
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

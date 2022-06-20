import { utils as ethersUtils } from 'ethers'
import { network, getTransactionManagerList } from '../__test_util__/testConfig'

import { TransactionManager } from '../util/TransactionManager'
import { ContractHandlerType } from '../type/contractType'

import {
  checkAllContract,
} from '../game/contract/contractCheck'

import {
  getUserId,
  getUserCardList,
} from '../game/user'

import {
  nftCreateCard,
  nftBurnCard,
} from '../game/nft'

import {
  listCard,
  cancelListCard,
  buyCard,
} from '../game/card'

import {
  loadAllTrade
} from '../game/trading'

import {
  newContractHandler
} from '../type/contractType'

const getNextCardToSold = (cardList: UserCardList) => {
  return cardList.filter(
    card => !card.sold &&
      card.price === 0 &&
      card.nftId.eq(0)
  ).sort((card1, card2) => {
    return card1.exp > card2.exp &&
      card1.sold &&
      !card1.price === 0 &&
      !card1.nftId.eq(0)
      ? -1 : 1
  })[0]
}

const testNFT = () => {
  jest.setTimeout(6000000)

  let transactionManager: TransactionManager[]

  let userId: number
  let userId1: number
  let userId2: number

  let contractHandler: ContractHandlerType
  let contractHandler1: ContractHandlerType
  let contractHandler2: ContractHandlerType

  beforeAll(done => {
    const func_async = (async () => {

      try {
        transactionManager = getTransactionManagerList()
        contractHandler = newContractHandler(transactionManager[0])
        contractHandler1 = newContractHandler(transactionManager[1])
        contractHandler2 = newContractHandler(transactionManager[2])
        const isOk = await checkAllContract(network, contractHandler, console.log)
        expect(isOk).toBeTruthy()
        const isOk1 = await checkAllContract(network, contractHandler1, console.log)
        expect(isOk1).toBeTruthy()
        const isOk2 = await checkAllContract(network, contractHandler2, console.log)
        expect(isOk2).toBeTruthy()

        userId = await getUserId(contractHandler, await transactionManager[0].signer.getAddress())
        expect(userId > 0).toBeTruthy()

        userId1 = await getUserId(contractHandler1, await transactionManager[1].signer.getAddress())
        expect(userId1 > 0).toBeTruthy()

        userId2 = await getUserId(contractHandler2, await transactionManager[2].signer.getAddress())
        expect(userId2 > 0).toBeTruthy()

        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('NFT', () => {
    it('Test NFT', async () => {
      const cardList = await getUserCardList(contractHandler, userId)
      const card = getNextCardToSold(cardList)
      console.log(card)
      const nftId = await nftCreateCard(contractHandler, card.id)
      await nftBurnCard(contractHandler, nftId)
    })
  })

  describe('Sell/Buy', () => {
    it('List/unlist', async () => {
      const cardList = await getUserCardList(contractHandler, userId)
      const card = getNextCardToSold(cardList)
      console.log(card)
      console.log(await loadAllTrade(contractHandler))
      await listCard(contractHandler, card.id, 1)
      console.log(await loadAllTrade(contractHandler))
      await cancelListCard(contractHandler, card.id)
    })
  })
}

testNFT()

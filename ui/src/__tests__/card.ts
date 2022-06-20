import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'



import { TransactionManager } from '../util/TransactionManager'
import {
  createAllCard,
  loadAllCard
} from '../game/card'

import {
  updateAllContract,
} from '../game/contract/contractUpdate'

import {
  newContractHandler
} from '../type/contractType'

const testTransaction = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(600000)

  let transactionManager: TransactionManager

  beforeAll(done => {
    const func_async = (async () => {

      try {
        walletList = getWalletList()
        transactionManager = new TransactionManager(walletList[0])
        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('Test card', () => {
    it('Test card', async () => {

      const contractHandler = newContractHandler(transactionManager)

      await updateAllContract(contractHandler)

      expect(contractHandler.gameManager.contract).toBeTruthy()

      if (contractHandler.gameManager.contract) {
        await createAllCard(contractHandler)
        //console.log(transactionManager.transactionList.map(transactionManager.gasInfo))
        console.log(transactionManager.transactionList.map(transactionManager.log))
        await loadAllCard(contractHandler)
      }
    })

  })
}

testTransaction()

import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'



import { TransactionManager } from '../util/TransactionManager'
import {
  createAllCard,
  loadAllCard
} from '../game/card'

import {
  createContract,
} from '../game/contract'

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

      const contract = await createContract(undefined, transactionManager)

      await createAllCard(contract)
      //console.log(transactionManager.transactionList.map(transactionManager.gasInfo))
      console.log(transactionManager.transactionList.map(transactionManager.log))
      await loadAllCard(contract)
    })

  })
}

testTransaction()

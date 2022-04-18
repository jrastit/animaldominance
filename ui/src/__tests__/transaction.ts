import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'

import {
  createWithManagerContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'

console.log("here")

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

  describe('Test transaction token', () => {
    it('Test transaction token', async () => {
      const contract = await createWithManagerContractCardAdmin(
        transactionManager
      )

      await transactionManager.sendTx(await contract.populateTransaction.createCard(
        1,
        1,
        1
      ), "Create card")
      console.log(transactionManager.transactionList.map(transactionManager.gasInfo))
      console.log(transactionManager.transactionList.map(transactionManager.log))
    })

  })
}

testTransaction()

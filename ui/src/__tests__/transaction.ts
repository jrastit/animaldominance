import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'

import {
  createWithManagerContractCardAdmin,
  createWithManagerContractPlayGameFactory,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'

const testTransaction = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(600000)

  let transactionManager: TransactionManager
  let transactionManager1: TransactionManager
  let transactionManager2: TransactionManager

  beforeAll(done => {
    const func_async = (async () => {

      try {
        walletList = getWalletList()
        transactionManager = new TransactionManager(walletList[0])
        transactionManager1 = new TransactionManager(walletList[1])
        transactionManager2 = new TransactionManager(walletList[2])
        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('Test transaction token', () => {
    it('Test account balance', async () => {
      console.log(await transactionManager.getAddress(), (ethers.utils.formatEther(await transactionManager.getBalance())))
      console.log(await transactionManager1.getAddress(), (ethers.utils.formatEther(await transactionManager1.getBalance())))
      console.log(await transactionManager2.getAddress(), (ethers.utils.formatEther(await transactionManager2.getBalance())))
    })

    it('Test transaction token', async () => {
      const factory = await createWithManagerContractPlayGameFactory(
        transactionManager
      )
      const contract = await createWithManagerContractCardAdmin(
        factory,
        transactionManager,
      )

      await transactionManager.sendTx(await contract.populateTransaction.createCard(
        'test',
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

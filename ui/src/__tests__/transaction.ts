import * as ethers from 'ethers'
import { getTransactionManagerList } from '../__test_util__/testConfig'

import {
  updateAllContract,
} from '../game/contract'

import {
  newContractHandler
} from '../type/contractType'

import { TransactionManager } from '../util/TransactionManager'

const testTransaction = () => {

  jest.setTimeout(600000)

  let transactionManager: TransactionManager[]

  beforeAll(done => {
    const func_async = (async () => {

      try {
        transactionManager = getTransactionManagerList()
        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('Test transaction token', () => {
    it('Test account balance', async () => {
      console.log(await transactionManager[0].getAddress(), (ethers.utils.formatEther(await transactionManager[0].getBalance())))
      console.log(await transactionManager[1].getAddress(), (ethers.utils.formatEther(await transactionManager[1].getBalance())))
      console.log(await transactionManager[2].getAddress(), (ethers.utils.formatEther(await transactionManager[2].getBalance())))
    })

    it('Test transaction token', async () => {
      const contractHandler = newContractHandler(transactionManager[0])
      await updateAllContract(contractHandler)

      if (contractHandler.gameManager.contract) {
        await contractHandler.gameManager.contract.createCard(
          'test',
          1,
          1,
          1
        )
      }
      console.log(transactionManager[0].transactionList.map(tx => transactionManager[0].gasInfo(tx)))
      console.log(transactionManager[0].transactionList.map(tx => transactionManager[0].log(tx)))
    })

  })
}

testTransaction()

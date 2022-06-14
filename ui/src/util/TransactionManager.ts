import * as ethers from 'ethers'

import TimerSemaphore from './TimerSemaphore'

export interface TransactionItem {
  txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
  tx: ethers.ethers.providers.TransactionResponse
  result: ethers.ethers.providers.TransactionReceipt
  log?: string
}

export function getErrorMessage(err: any) {
  //console.error(err)
  let message
  try {
    message = JSON.parse(err.error.body).error.message
  } catch {
    if (err.error) {
      message = err.error
    } else {
      message = err
    }

  }
  return message
}

export class TransactionManager {
  signer: ethers.Signer

  transactionList: TransactionItem[]

  nextNonce: number

  timerSemaphore: TimerSemaphore | undefined

  constructor(signer: ethers.Signer, timerSemaphore?: TimerSemaphore) {
    this.signer = signer
    this.transactionList = []
    this.nextNonce = -1
    this.timerSemaphore = timerSemaphore
  }

  async getBalance() {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(this.signer, this.signer.getBalance) as Promise<ethers.BigNumber>
    } else {
      return this.signer.getBalance()
    }
  }

  async getNonce() {
    if (this.nextNonce === -1) {
      if (this.timerSemaphore) {
        this.nextNonce = await this.timerSemaphore.callClassFunction(
          this.signer,
          this.signer.getTransactionCount
        ) as number
      } else {
        this.nextNonce = await this.signer.getTransactionCount()
      }
    } else {
      this.nextNonce = this.nextNonce + 1
    }
    return this.nextNonce
  }

  async populateTransaction(contractClass: any, functionName: string, ...args: any[]) {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(this, this._populateTransaction, contractClass, functionName, ...args) as Promise<ethers.ethers.PopulatedTransaction>
    }
    return this._populateTransaction(contractClass, functionName, ...args)

  }

  async _populateTransaction(contractClass: any, functionName: string, ...args: any[]) {
    return contractClass.contract.populateTransaction[functionName](...args)
  }

  async sendTx(txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest, log: string) {
    if (!txu) {
      console.error(txu)
    }
    if (this.timerSemaphore) {
      return this.timerSemaphore.callClassFunction(this, this._sendTx, txu, log) as Promise<TransactionItem>
    } else {
      return this._sendTx(txu, log)
    }
  }

  async _sendTx(txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest, log: string) {
    try {
      txu.gasLimit = (await this.signer.estimateGas(txu)).mul(120).div(100)
      txu.gasPrice = await this.signer.getGasPrice()
      txu.nonce = await this.getNonce()
      const tx = await this.signer.sendTransaction(txu)
      const result = await tx.wait()
      const transactionItem = {
        txu,
        tx,
        result,
        log
      } as TransactionItem
      this.transactionList.push(transactionItem)
      console.log("Success => " +
        log +
        ":" +
        txu.nonce +
        ' ' +
        result.gasUsed.toNumber() +
        ' ' +
        (Math.round(result.gasUsed.mul(10000).div(txu.gasLimit).toNumber()) / 100) +
        '% ' +
        ethers.utils.formatEther(txu.gasPrice.mul(result.gasUsed)))
      return transactionItem
    } catch (e: any) {
      this.nextNonce = -1
      const message = getErrorMessage(e)
      throw new Error(log + ' : ' + message)
    }

  }

  async callView(fnToCall: any, ...args: any[]) {
    if (this.timerSemaphore) {
      return this.timerSemaphore.callFunction(fnToCall, ...args) as Promise<any>
    } else {
      return fnToCall(...args)
    }
  }

  async sendContractTx(
    txu: ethers.providers.TransactionRequest,
    getContract: (
      contractAddress: string,
      signer: ethers.Signer,
    ) => ethers.Contract,
    log: string
  ) {
    console.log("send contract tx")
    const result = await this.sendTx(txu, log)
    const contract = getContract(result.result.contractAddress, this.signer)
    console.log("send contract tx end")
    return contract
  }

  gasInfo(
    transactionItem: TransactionItem
  ) {
    return {
      transactionHash: transactionItem.result.transactionHash,
      log: transactionItem.log,
      gasUsed: transactionItem.result.gasUsed.toNumber(),
      gasLimit: transactionItem.tx.gasLimit.toNumber(),
      gasPrice: transactionItem.tx.gasPrice && transactionItem.tx.gasPrice.toNumber(),
    }
  }

  log(
    transactionItem: TransactionItem
  ) {
    return transactionItem.log
  }

  async getAddress() {
    return await this.signer.getAddress()
  }
}

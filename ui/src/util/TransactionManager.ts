import * as ethers from 'ethers'

export interface TransactionItem {
  txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest,
  tx: ethers.ethers.providers.TransactionResponse
  result: ethers.ethers.providers.TransactionReceipt
  log?: string
}

export class TransactionManager {
  signer: ethers.Signer

  transactionList: TransactionItem[]

  nextNonce: number

  constructor(signer: ethers.Signer) {
    this.signer = signer
    this.transactionList = []
    this.nextNonce = -1
  }

  async getBalance() {
    return this.signer.getBalance()
  }

  async getNonce() {
    if (this.nextNonce === -1) {
      this.nextNonce = await this.signer.getTransactionCount()
    } else {
      this.nextNonce = this.nextNonce + 1
    }
    return this.nextNonce
  }

  async sendTx(txu: ethers.ethers.PopulatedTransaction | ethers.providers.TransactionRequest, log: string) {
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
      console.error(e)
      let message
      try {
        message = JSON.parse(e.error.body).error.message
      } catch {
        message = e.error
      }
      throw new Error(log + ' : ' + message)
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
    const result = await this.sendTx(txu, log)
    return getContract(result.result.contractAddress, this.signer)
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

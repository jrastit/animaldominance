import { Contract, EventFilter } from 'ethers'
import { Listener } from '@ethersproject/abstract-provider'
import { TransactionManager } from '../util/TransactionManager'

export type ContractFunction<T = any> = (...args: Array<any>) => Promise<T>;

function initContract(contractClass: any, abi: any[]) {
  console.log('init contract')
  //test(contract)
  //console.log(jsonCardAdmin.abi)
  //const functionList = jsonCardAdmin.abi.filter(obj => obj.type === "function" && (obj.stateMutability === "payable" || obj.stateMutability === "nonpayable"))
  //console.log(functionList)
  //ContractCardAdmin.prototype
  //console.log(getClassMethodNames(contract))
  const functionList = abi.filter(obj => obj.type === "function" && (obj.stateMutability === "payable" || obj.stateMutability === "nonpayable"))
  functionList.forEach(obj => {
    if (typeof obj.name === 'string') {
      const functionName = obj.name as string
      Object.defineProperty(contractClass, functionName, {
        value: async (...args: any[]) => {
          console.log("call function ", functionName)
          return await contractClass.transactionManager.sendTx(await contractClass.contract.populateTransaction[functionName](...args), functionName)
        },
        writable: false,
        enumerable: true,
        configurable: true,
      })
    }

  })
  const viewList = abi.filter(obj => obj.type === "function" && (obj.stateMutability === "view" || obj.stateMutability === "pure"))
  viewList.forEach(obj => {
    if (typeof obj.name === 'string') {
      const functionName = obj.name as string
      console.log("define view ", functionName)
      Object.defineProperty(contractClass, functionName, {
        value: async (...args: any[]) => {
          console.log("call view ", functionName)
          return await contractClass.contract.functions[functionName](...args)
        },
        writable: false,
        enumerable: true,
        configurable: true,
      })
    }

  })
}

class ContractGeneric {
  contract: Contract
  transactionManager: TransactionManager
  address: string
  listenerCount(eventName?: EventFilter | string) {
    return this.contract.listenerCount(eventName)
  }
  on(event: EventFilter | string, listener: Listener): this {
    this.contract.on(event, listener)
    return this
  }
  interface
  signer

  constructor(contract: Contract, transactionManager: TransactionManager) {
    this.address = contract.address
    this.contract = contract
    this.transactionManager = transactionManager
    this.interface = contract.interface
    this.signer = contract.signer


  }



}

export { ContractGeneric, initContract }

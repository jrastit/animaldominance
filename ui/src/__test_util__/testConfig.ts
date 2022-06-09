import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'
import TimerSemaphore from '../util/TimerSemaphore'

import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'

const networkName = "ganache"
//const networkName = "Emerald Testnet"
//const networkName = "Arbitrum Testnet"
//const networkName = "Matic Mumbai Testnet"
//const networkName = "Matic Mainnet"

export const network: NetworkType = networkList.filter((network) => network.name === networkName)[0]

let timerSemaphore = undefined as TimerSemaphore | undefined

if (network.timeBetweenRequest) {
  timerSemaphore = new TimerSemaphore(network.timeBetweenRequest, network.retry)
}

export let privateKeys = require("../../key/" + networkName.replace(/ /g, "") + "PrivateKeys.json")
const url = network.url
export const provider = new ethers.providers.JsonRpcProvider(url)

export const getWalletList = (): ethers.Signer[] => {
  return privateKeys.map((pk: string): ethers.Signer => {
    return new ethers.Wallet(pk, provider)
  })
}

export const getTransactionManagerList = () => {
  return getWalletList().map((signer: ethers.Signer): TransactionManager =>
    new TransactionManager(signer, timerSemaphore)
  )
}

export const constant = {
  kovanDaiAddress: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
  addressOne: "0x0000000000000000000000000000000000000001",
  tokenName: "test",
  tokenSymbol: "TST",
  tokenDecimals: 9,
  token2Name: "test2",
  token2Symbol: "TST2",
  token2Decimals: 10,
}

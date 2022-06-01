import {
  utils as ethersUtils,
  BigNumber,
} from 'ethers'

import {
  createWithManagerContractAnimalDominance,
  createWithManagerContractPlayGameFactory,
  createWithManagerContractPlayActionLib,
  createWithManagerContractGameManager,
  getWithManagerContractAnimalDominance,
  getWithManagerContractGameManager,
  getHashContractGameManager,
  getHashContractPlayGameFactory,
  getHashContractTrading,
  getHashContractAnimalDominance,
  ContractAnimalDominance,
} from '../contract/solidity/compiled/contractAutoFactory'

import { NetworkType } from '../type/networkType'

import { TransactionManager } from '../util/TransactionManager'

const getHashContract = function() {
  return ethersUtils.id(
    getHashContractPlayGameFactory() +
    getHashContractTrading() +
    getHashContractGameManager()
  )
}

const createAnimalDominanceContract = async (
  transactionManager: TransactionManager,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract Animal Dominance...")
  const animalDominance = await createWithManagerContractAnimalDominance(
    BigNumber.from(getHashContractAnimalDominance()),
    transactionManager
  )
  console.log("AnimalDominance created at " + animalDominance.address)
  return animalDominance
}

export const getAnimalDominanceContract = async (
  network: NetworkType,
  transactionManager: TransactionManager,
  _setMessage?: (message: string | undefined) => void,
) => {
  let animalDominance = undefined
  if (network && network.gameContract) {
    const _animalDominance = getWithManagerContractAnimalDominance(ethersUtils.getAddress(network.gameContract), transactionManager)
    try {
      _setMessage && _setMessage("Checking Animal Dominance contract...")
      const contractHash = (await _animalDominance.contractHash())[0]
      console.log("animalDominance hash", contractHash.toHexString(), getHashContractAnimalDominance())
      if (BigNumber.from(getHashContractAnimalDominance()).eq(contractHash)) {
        animalDominance = _animalDominance
      }
    } catch (err: any) {
      console.error(err)
    }
  }
  return animalDominance
}

export const getOrCreateAnimalDominanceContract = async (
  network: NetworkType,
  transactionManager: TransactionManager,
  _setMessage?: (message: string | undefined) => void,
) => {
  const animalDominance = await getAnimalDominanceContract(
    network,
    transactionManager,
    _setMessage,
  )
  if (animalDominance) return animalDominance
  return await createAnimalDominanceContract(
    transactionManager,
    _setMessage,
  )
}

export const getContract = async (
  network: NetworkType,
  transactionManager: TransactionManager,
  _setMessage?: (message: string | undefined) => void,
) => {
  const animalDominance = await getAnimalDominanceContract(
    network,
    transactionManager,
    _setMessage,
  )
  if (!animalDominance) {
    return
  }
  _setMessage && _setMessage("Get contract game manager address...")
  try {
    const contractAddress = (await animalDominance.getGameManager(getHashContract()))[0]
    if (contractAddress) {
      return getWithManagerContractGameManager(contractAddress, transactionManager)
    }
  } catch {

  }

}

export const createContract = async (
  animalDominance: ContractAnimalDominance | undefined,
  transactionManager: TransactionManager,
  _setMessage?: (message: string | undefined) => void,
) => {

  if (!animalDominance) {
    animalDominance = await createAnimalDominanceContract(transactionManager, _setMessage)

  }

  _setMessage && _setMessage("Creating contract game factory...")
  const factory = await createWithManagerContractPlayGameFactory(
    transactionManager
  )
  _setMessage && _setMessage("Creating contract play action lib...")
  const playActionLib = await createWithManagerContractPlayActionLib(
    transactionManager
  )
  _setMessage && _setMessage("Creating contract game manager...")
  const contract = await createWithManagerContractGameManager(
    factory,
    playActionLib,
    transactionManager,
  )
  _setMessage && _setMessage("Register game manager...")
  await animalDominance.addGameManager(getHashContract(), contract.address)
  return contract
}

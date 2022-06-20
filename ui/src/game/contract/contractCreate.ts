import {
  constants as ethersConstants,
  BigNumber,
} from 'ethers'

import {
  TransactionManager
} from '../../util/TransactionManager'

import {
  createWithManagerContractAnimalDominance,
  createWithManagerContractPlayGameFactory,
  createWithManagerContractPlayActionLib,
  createWithManagerContractTrading,
  createWithManagerContractNFT,
  createWithManagerContractPlayBot,
  createWithManagerContractCardList,

  getWithManagerContractPlayGameFactory,
  getWithManagerContractPlayActionLib,
  getWithManagerContractNFT,
  getWithManagerContractPlayBot,
  getWithManagerContractCardList,

} from '../../contract/solidity/compiled/contractAutoFactory'

import {
  getHashContractPlayGameFactory,
  getHashContractPlayActionLib,
  getHashContractPlayBot,
  getHashContractTrading,
  getHashContractNFT,
  getHashContractAnimalDominance,
  getHashContractCardList,
} from './contractHash'

import { ContractHandlerType } from '../../type/contractType'

export const createContractAnimalDominance = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract Animal Dominance...")
  contractHandler.animalDominance.contract = await createWithManagerContractAnimalDominance(
    getHashContractAnimalDominance(),
    contractHandler.transactionManager
  )
}

const _createContract = async <T extends { address: string }>(
  name: string,
  contractHash: BigNumber,
  createWithManager: (
    contractHash: BigNumber,
    transactionManager: TransactionManager
  ) => Promise<T>,
  getWithManager: (
    contractAddress: string,
    transactionManager: TransactionManager
  ) => T,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  let contract: T | undefined
  if (contractHandler.animalDominance.versionOk) {
    _setMessage && _setMessage("Loading contract " + name + "...")
    const contractAddress = (await contractHandler.animalDominance.getContract().getContract(contractHash))[0]
    if (contractAddress !== ethersConstants.AddressZero) {
      contract = getWithManager(
        contractAddress,
        contractHandler.transactionManager,
      )
    }
  }
  if (!contract) {
    _setMessage && _setMessage("Creating contract " + name + "...")
    contract = await createWithManager(
      contractHash,
      contractHandler.transactionManager,
    )
  }
  if (contractHandler.animalDominance.versionOk) {
    await contractHandler.animalDominance.getContract().addContract(
      contractHash,
      contract.address
    )
  }
  return contract
}

export const createContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playGameFactory.contract = await _createContract(
    "PlayGameFactory",
    getHashContractPlayGameFactory(),
    createWithManagerContractPlayGameFactory,
    getWithManagerContractPlayGameFactory,
    contractHandler,
    _setMessage,
  )
}

export const createContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playActionLib.contract = await _createContract(
    "PlayActionLib",
    getHashContractPlayActionLib(),
    createWithManagerContractPlayActionLib,
    getWithManagerContractPlayActionLib,
    contractHandler,
    _setMessage,
  )
}

export const createContractCardList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.cardList.contract = await _createContract(
    "CarList",
    getHashContractCardList(),
    createWithManagerContractCardList,
    getWithManagerContractCardList,
    contractHandler,
    _setMessage,
  )
}

export const createContractNFT = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.nft.contract = await _createContract(
    "NFT",
    getHashContractNFT(),
    (contractHash: BigNumber,
      transactionManager: TransactionManager, ) => {
      return createWithManagerContractNFT(
        contractHandler.gameManager.getContract().address,
        500, //5%
        contractHandler.animalDominance.getContract().address,
        window.location.hostname === "localhost" ? "http://localhost/nft/" : "https://animaldominance.com/nft/",
        contractHash,
        transactionManager,
      )
    },
    getWithManagerContractNFT,
    contractHandler,
    _setMessage,
  )
}

export const createContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  contractHandler.playBot.contract = await _createContract(
    "PlayBot",
    getHashContractPlayBot(),
    createWithManagerContractPlayBot,
    getWithManagerContractPlayBot,
    contractHandler,
    _setMessage,
  )
}

export const createContractTrading = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.contract && contractHandler.gameManager.versionOk) {
    _setMessage && _setMessage("Creating contract trading...")
    contractHandler.trading.contract = await createWithManagerContractTrading(
      contractHandler.gameManager.contract,
      getHashContractTrading(),
      contractHandler.transactionManager,
    )
  } else {
    contractHandler.trading.contract = undefined
  }
}

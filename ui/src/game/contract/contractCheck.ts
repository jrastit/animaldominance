import {
  utils as ethersUtils,
  constants as ethersConstants,
  BigNumber,
} from 'ethers'

import {
  TransactionManager
} from '../../util/TransactionManager'

import {
  ContractType
} from '../../type/contractType'

import {
  getWithManagerContractAnimalDominance,
  getWithManagerContractPlayGameFactory,
  getWithManagerContractPlayActionLib,
  getWithManagerContractGameManager,
  getWithManagerContractTrading,
  getWithManagerContractNFT,
  getWithManagerContractPlayBot,
  getWithManagerContractGameList,
  getWithManagerContractCardList,
} from '../../contract/solidity/compiled/contractAutoFactory'

import {
  getHashContractGameManager,
  getHashContractPlayGameFactory,
  getHashContractPlayActionLib,
  getHashContractPlayBot,
  getHashContractTrading,
  getHashContractNFT,
  getHashContractAnimalDominance,
  getHashContractGameList,
  getHashContractCardList,
} from './contractHash'

import { ContractHandlerType } from '../../type/contractType'

import { NetworkType } from '../../type/networkType'

const checkContractAnimalDominance = async (
  network: NetworkType | undefined,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (network && network.gameContract) {
    contractHandler.animalDominance.contract = getWithManagerContractAnimalDominance(
      ethersUtils.getAddress(network.gameContract),
      contractHandler.transactionManager
    )
  }
  if (contractHandler.animalDominance.contract) {
    try {
      _setMessage && _setMessage("Checking Animal Dominance contract...")
      contractHandler.animalDominance.contractHash = (await contractHandler.animalDominance.contract.contractHash())[0]
      if (contractHandler.animalDominance.contractHash) {
        if (getHashContractAnimalDominance().eq(contractHandler.animalDominance.contractHash)) {
          contractHandler.animalDominance.versionOk = true
        } else {
          contractHandler.animalDominance.versionOk = false
        }
      } else {
        contractHandler.animalDominance.versionOk = undefined
      }
    } catch (err: any) {
      contractHandler.animalDominance.versionOk = undefined
    }
  } else {
    contractHandler.animalDominance.versionOk = undefined
  }
}

const _checkContract = async <T extends {
  address: string,
  contractHash?: any
}>(
  name: string,
  contract: ContractType<T>,
  contractHash: BigNumber,
  getContract: (address: string, transactionManager: TransactionManager) => T,
  getContractAddress: () => Promise<string>,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (getContractAddress) {
    try {
      _setMessage && _setMessage("Get contract address " + name + "...")
      const contractAddress = (await getContractAddress())[0]
      if (contractAddress === ethersConstants.AddressZero) {
        contract.versionOk = undefined
      } else {
        contract.contract = getContract(
          contractAddress,
          contractHandler.transactionManager
        )
        _setMessage && _setMessage("Get hash " + name + "...")
        contract.contractHash = (await contract.contract.contractHash())[0]
        if (contract.contractHash) {
          contract.versionOk = contractHash.eq(contract.contractHash)
          _setMessage && _setMessage(
            "Contract " + name +
            " " + (contract.versionOk ? 'Ok' : 'Ko')
          )
        }
      }
    } catch (err) {
      console.error(err)
      contract.versionOk = undefined
    }
  } else {
    contract.versionOk = undefined
  }

}

const _checkContractWithHash = async <T extends {
  address: string,
  contractHash?: any
}>(
  name: string,
  contract: ContractType<T>,
  contractHash: BigNumber,
  getContract: (address: string, transactionManager: TransactionManager) => T,
  getContractAddress: (contractHash: BigNumber) => Promise<string>,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (getContractAddress) {
    try {
      _setMessage && _setMessage("Get contract from hash " + name + "...")
      const contractAddress = (await getContractAddress(contractHash))[0]
      if (contractAddress === ethersConstants.AddressZero) {
        contract.versionOk = false
      } else {
        contract.contract = getContract(
          contractAddress,
          contractHandler.transactionManager
        )
        contract.versionOk = true
      }
    } catch (err) {
      console.error(err)
      contract.versionOk = undefined
    }
  } else {
    contract.versionOk = undefined
  }
}

const checkContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "PlayGameFactory",
    contractHandler.playGameFactory,
    getHashContractPlayGameFactory(),
    getWithManagerContractPlayGameFactory,
    contractHandler.gameList.getContract().playGameFactory,
    contractHandler,
    _setMessage,
  )
}

const checkContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "PlayActionLib",
    contractHandler.playActionLib,
    getHashContractPlayActionLib(),
    getWithManagerContractPlayActionLib,
    contractHandler.gameList.getContract().playActionLib,
    contractHandler,
    _setMessage,
  )
}

const checkContractTrading = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "Trading",
    contractHandler.trading,
    getHashContractTrading(),
    getWithManagerContractTrading,
    contractHandler.gameManager.getContract().trading,
    contractHandler,
    _setMessage,
  )
}

const checkContractNFT = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "NFT",
    contractHandler.nft,
    getHashContractNFT(),
    getWithManagerContractNFT,
    contractHandler.gameManager.getContract().nft,
    contractHandler,
    _setMessage,
  )
}

const checkContractCardList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "CardList",
    contractHandler.cardList,
    getHashContractCardList(),
    getWithManagerContractCardList,
    contractHandler.gameManager.getContract().cardList,
    contractHandler,
    _setMessage,
  )
}

const checkContractGameList = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContract(
    "GameList",
    contractHandler.gameList,
    getHashContractGameList(),
    getWithManagerContractGameList,
    contractHandler.gameManager.getContract().gameList,
    contractHandler,
    _setMessage,
  )
}

const checkContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContractWithHash(
    "PlayBot",
    contractHandler.playBot,
    getHashContractPlayBot(),
    getWithManagerContractPlayBot,
    contractHandler.gameList.getContract().playBotMap,
    contractHandler,
    _setMessage,
  )
}

const checkContractGameManager = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await _checkContractWithHash(
    "GameManager",
    contractHandler.gameManager,
    getHashContractGameManager(),
    getWithManagerContractGameManager,
    contractHandler.animalDominance.getContract().getContract,
    contractHandler,
    _setMessage,
  )
}

export const checkAllContract = async (
  network: NetworkType | undefined,
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  await checkContractAnimalDominance(network, contractHandler, _setMessage)
  if (contractHandler.animalDominance.versionOk) {
    await checkContractGameManager(contractHandler, _setMessage)
    if (contractHandler.gameManager.versionOk) {
      await checkContractCardList(contractHandler, _setMessage)
      await checkContractTrading(contractHandler, _setMessage)
      await checkContractNFT(contractHandler, _setMessage)
      await checkContractGameList(contractHandler, _setMessage)
      if (contractHandler.gameList.versionOk) {
        await checkContractPlayActionLib(contractHandler, _setMessage)
        await checkContractPlayGameFactory(contractHandler, _setMessage)
        await checkContractPlayBot(contractHandler, _setMessage)
      }
    }
  }

  return (
    contractHandler.animalDominance.versionOk &&
    contractHandler.gameManager.versionOk &&
    contractHandler.gameList.versionOk &&
    contractHandler.cardList.versionOk &&
    contractHandler.nft.versionOk &&
    contractHandler.playActionLib.versionOk &&
    contractHandler.playGameFactory.versionOk &&
    contractHandler.trading.versionOk &&
    contractHandler.playBot.versionOk
  )
}

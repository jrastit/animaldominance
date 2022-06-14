import {
  utils as ethersUtils,
  constants as ethersConstants,
} from 'ethers'

import {
  createWithManagerContractAnimalDominance,
  createWithManagerContractPlayGameFactory,
  createWithManagerContractPlayActionLib,
  createWithManagerContractGameManager,
  getWithManagerContractAnimalDominance,
  getWithManagerContractPlayGameFactory,
  getWithManagerContractPlayActionLib,
  createWithManagerContractTrading,
  createWithManagerContractPlayBot,
  getWithManagerContractGameManager,
  getWithManagerContractTrading,
  getWithManagerContractPlayBot,
  getHashContractGameManager,
  getHashContractPlayGameFactory,
  getHashContractPlayGame,
  getHashContractPlayActionLib,
  getHashContractPlayBot,
  getHashContractTrading,
  getHashContractAnimalDominance,
} from '../contract/solidity/compiled/contractAutoFactory'

import { ContractHandlerType } from '../type/contractType'

import { NetworkType } from '../type/networkType'

const _getHashContractPlayGameFactory = () => {
  return getHashContractPlayGameFactory().xor(getHashContractPlayGame())
}

const updateContractAnimalDominance = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract Animal Dominance...")
  contractHandler.animalDominance.contract = await createWithManagerContractAnimalDominance(
    getHashContractAnimalDominance(),
    contractHandler.transactionManager
  )
  contractHandler.animalDominance.contractHash = getHashContractAnimalDominance()
  contractHandler.animalDominance.versionOk = true
  console.log("AnimalDominance created at " + contractHandler.animalDominance.contract.address)
}

const createContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract game factory...")
  contractHandler.playGameFactory.contract = await createWithManagerContractPlayGameFactory(
    _getHashContractPlayGameFactory(),
    contractHandler.transactionManager,
  )
}

const updateContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.contract && contractHandler.gameManager.versionOk) {
    await createContractPlayGameFactory(contractHandler, _setMessage)
    if (contractHandler.playGameFactory.contract) {
      _setMessage && _setMessage("Update play action lib...")
      await contractHandler.gameManager.contract.updatePlayGameFactory(
        _getHashContractPlayGameFactory(),
        contractHandler.playGameFactory.contract.address
      )
      contractHandler.playGameFactory.contractHash = _getHashContractPlayGameFactory()
      contractHandler.playGameFactory.versionOk = true
    }
  }
}

const createContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("Creating contract play action lib...")
  contractHandler.playActionLib.contract = await createWithManagerContractPlayActionLib(
    getHashContractPlayActionLib(),
    contractHandler.transactionManager,
  )
}

const updateContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.contract && contractHandler.gameManager.versionOk) {
    await createContractPlayActionLib(contractHandler, _setMessage)
    if (contractHandler.playActionLib.contract) {
      _setMessage && _setMessage("Update play action lib...")
      await contractHandler.gameManager.contract.updatePlayActionLib(
        getHashContractPlayActionLib(),
        contractHandler.playActionLib.contract.address
      )
      contractHandler.playActionLib.contractHash = getHashContractPlayActionLib()
      contractHandler.playActionLib.versionOk = true
    }
  }
}

const updateContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.contract && contractHandler.gameManager.versionOk) {
    _setMessage && _setMessage("Creating contract play bot...")
    contractHandler.playBot.contract = await createWithManagerContractPlayBot(
      contractHandler.transactionManager,
    )
    _setMessage && _setMessage("Add play bot to game manager...")
    await contractHandler.gameManager.contract.addBot(
      getHashContractPlayBot(),
      contractHandler.playBot.contract.address
    )
    contractHandler.playBot.contractHash = getHashContractPlayBot()
    contractHandler.playBot.versionOk = true
  } else {
    contractHandler.playBot.contractHash = undefined
    contractHandler.playBot.versionOk = false
  }
}

const updateContractTrading = async (
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
    _setMessage && _setMessage("Add trading to game manager...")
    await contractHandler.gameManager.contract.updateTrading(
      contractHandler.trading.contract.address
    )
    contractHandler.trading.contractHash = getHashContractTrading()
    contractHandler.trading.versionOk = true
  } else {
    contractHandler.trading.contractHash = undefined
    contractHandler.trading.versionOk = false
  }
}

const updateContractGameManager = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {

  if (contractHandler.animalDominance.contract && contractHandler.animalDominance.versionOk) {
    await createContractPlayGameFactory(
      contractHandler,
      _setMessage
    )
    if (contractHandler.playGameFactory.contract) {
      await createContractPlayActionLib(
        contractHandler,
        _setMessage
      )
      if (contractHandler.playActionLib.contract) {
        _setMessage && _setMessage("Creating contract game manager...")
        contractHandler.gameManager.contract = await createWithManagerContractGameManager(
          contractHandler.playGameFactory.contract,
          contractHandler.playActionLib.contract,
          contractHandler.transactionManager,
        )
        if (contractHandler.gameManager.contract) {
          contractHandler.animalDominance.contract.addGameManager(
            getHashContractGameManager(),
            contractHandler.gameManager.contract.address,
          )
          contractHandler.gameManager.contractHash = getHashContractGameManager()
          contractHandler.gameManager.versionOk = true
          contractHandler.playGameFactory.contractHash = _getHashContractPlayGameFactory()
          contractHandler.playGameFactory.versionOk = true
          contractHandler.playActionLib.contractHash = getHashContractPlayActionLib()
          contractHandler.playActionLib.versionOk = true
        }

      }
    }
  } else {
    contractHandler.gameManager.contractHash = undefined
    contractHandler.gameManager.versionOk = false
  }
}

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

const checkContractPlayGameFactory = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.versionOk && contractHandler.gameManager.contract) {
    try {
      _setMessage && _setMessage("Get contract play game factory...")
      contractHandler.playGameFactory.contract = getWithManagerContractPlayGameFactory(
        (await contractHandler.gameManager.contract.playGameFactory())[0],
        contractHandler.transactionManager
      )
      if (contractHandler.playGameFactory.contract.address === ethersConstants.AddressZero) {
        contractHandler.playGameFactory.versionOk = undefined
      } else {
        _setMessage && _setMessage("Get hash play game factory...")
        contractHandler.playGameFactory.contractHash = (await contractHandler.playGameFactory.contract.contractHash())[0]
        if (contractHandler.playGameFactory.contractHash) {
          contractHandler.playGameFactory.versionOk = _getHashContractPlayGameFactory().eq(contractHandler.playGameFactory.contractHash)
        }
      }
    } catch {
      contractHandler.playGameFactory.versionOk = undefined
    }
  } else {
    contractHandler.playGameFactory.versionOk = undefined
  }
}

const checkContractPlayActionLib = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.versionOk && contractHandler.gameManager.contract) {
    try {
      _setMessage && _setMessage("Get contract play action lib...")
      contractHandler.playActionLib.contract = getWithManagerContractPlayActionLib(
        (await contractHandler.gameManager.contract.playActionLib())[0],
        contractHandler.transactionManager
      )
      if (contractHandler.playActionLib.contract.address === ethersConstants.AddressZero) {
        contractHandler.playActionLib.versionOk = undefined
      } else {
        _setMessage && _setMessage("Get hash play action lib...")
        contractHandler.playActionLib.contractHash = (await contractHandler.playActionLib.contract.contractHash())[0]
        if (contractHandler.playActionLib.contractHash) {
          contractHandler.playActionLib.versionOk = getHashContractPlayActionLib().eq(contractHandler.playActionLib.contractHash)
        } else {
          contractHandler.playActionLib.versionOk = undefined
        }
      }
    } catch {
      contractHandler.playActionLib.versionOk = undefined
    }
  } else {
    contractHandler.playActionLib.versionOk = undefined
  }
}

const checkContractTrading = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.versionOk && contractHandler.gameManager.contract) {
    try {
      _setMessage && _setMessage("Get contract trading...")
      contractHandler.trading.contract = getWithManagerContractTrading(
        (await contractHandler.gameManager.contract.trading())[0],
        contractHandler.transactionManager
      )
      if (contractHandler.trading.contract.address === ethersConstants.AddressZero) {
        contractHandler.trading.versionOk = undefined
      } else {
        _setMessage && _setMessage("Get hash trading...")
        contractHandler.trading.contractHash = (await contractHandler.trading.contract.contractHash())[0]
        if (contractHandler.trading.contractHash) {
          contractHandler.trading.versionOk = getHashContractTrading().eq(contractHandler.trading.contractHash)
        } else {
          contractHandler.trading.versionOk = undefined
        }
      }
    } catch {
      contractHandler.trading.versionOk = undefined
    }
  } else {
    contractHandler.trading.versionOk = undefined
  }
}

const checkContractPlayBot = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.gameManager.versionOk && contractHandler.gameManager.contract) {
    try {
      _setMessage && _setMessage("Get contract play bot...")
      contractHandler.playBot.contract = getWithManagerContractPlayBot(
        (await contractHandler.gameManager.contract.playBotMap(getHashContractPlayBot()))[0],
        contractHandler.transactionManager
      )
      if (contractHandler.playBot.contract.address === ethersConstants.AddressZero) {
        contractHandler.playBot.versionOk = false
      } else {
        contractHandler.playBot.versionOk = true
      }
    } catch {
      contractHandler.playBot.versionOk = undefined
    }
  } else {
    contractHandler.playBot.versionOk = undefined
  }
}

const checkContractGameManager = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (contractHandler.animalDominance.versionOk && contractHandler.animalDominance.contract) {
    try {
      _setMessage && _setMessage("Get contract game manager...")
      contractHandler.gameManager.contract = getWithManagerContractGameManager(
        (await contractHandler.animalDominance.contract.getGameManager(getHashContractGameManager()))[0],
        contractHandler.transactionManager
      )
      if (contractHandler.gameManager.contract.address === ethersConstants.AddressZero) {
        contractHandler.gameManager.versionOk = false
      } else {
        contractHandler.gameManager.versionOk = true
      }
    } catch {
      contractHandler.gameManager.versionOk = undefined
    }
  } else {
    contractHandler.gameManager.versionOk = undefined
  }
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
      await checkContractPlayActionLib(contractHandler, _setMessage)
      await checkContractPlayGameFactory(contractHandler, _setMessage)
      await checkContractTrading(contractHandler, _setMessage)
      await checkContractPlayBot(contractHandler, _setMessage)
    }
  }

  return (
    contractHandler.animalDominance.versionOk &&
    contractHandler.gameManager.versionOk &&
    contractHandler.playActionLib.versionOk &&
    contractHandler.playGameFactory.versionOk &&
    contractHandler.trading.versionOk &&
    contractHandler.playBot.versionOk
  )
}

export const updateAllContract = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  if (!contractHandler.animalDominance.versionOk) {
    await updateContractAnimalDominance(contractHandler, _setMessage)
  }
  if (contractHandler.animalDominance.versionOk) {
    if (!contractHandler.gameManager.versionOk) {
      await updateContractGameManager(contractHandler, _setMessage)
    }
    if (contractHandler.gameManager.versionOk) {
      if (!contractHandler.playActionLib.versionOk) {
        await updateContractPlayActionLib(contractHandler, _setMessage)
      }
      if (!contractHandler.playGameFactory.versionOk) {
        await updateContractPlayGameFactory(contractHandler, _setMessage)
      }
      if (!contractHandler.trading.versionOk) {
        await updateContractTrading(contractHandler, _setMessage)
      }
      if (!contractHandler.playBot.versionOk) {
        await updateContractPlayBot(contractHandler, _setMessage)
      }
    }
  }
}

export const updateAnimalDominanceContractHash = async (
  contractHandler: ContractHandlerType,
  _setMessage?: (message: string | undefined) => void,
) => {
  _setMessage && _setMessage("get contract Animal Dominance...")
  if (contractHandler.animalDominance.contract && contractHandler.animalDominance.contractHash) {
    const newContractHash = getHashContractAnimalDominance()
    if (!newContractHash.eq(contractHandler.animalDominance.contractHash)) {
      await contractHandler.animalDominance.contract.setContractHash(newContractHash)
      contractHandler.animalDominance.contractHash = newContractHash
      contractHandler.animalDominance.versionOk = true
    }
    contractHandler.animalDominance.versionOk = contractHandler.animalDominance.contractHash ?
      newContractHash.eq(contractHandler.animalDominance.contractHash) :
      false
  }
}

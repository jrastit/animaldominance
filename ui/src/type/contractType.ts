import { BigNumber } from 'ethers'

import {
  ContractAnimalDominance,
  ContractGameManager,
  ContractTrading,
  ContractPlayBot,
  ContractPlayGameFactory,
  ContractPlayActionLib,
  ContractPlayGame,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  TransactionManager
} from '../util/TransactionManager'

export type ContractType<Contract> = {
  contract?: Contract
  contractHash?: BigNumber | undefined
  versionOk?: boolean | undefined
}

export type ContractHandlerType = {
  transactionManager: TransactionManager
  animalDominance: ContractType<ContractAnimalDominance>
  gameManager: ContractType<ContractGameManager>

  trading: ContractType<ContractTrading>

  playGameFactory: ContractType<ContractPlayGameFactory>
  playGame: ContractType<ContractPlayGame>
  playActionLib: ContractType<ContractPlayActionLib>

  playBot: ContractType<ContractPlayBot>

}

export const newContractHandler = (
  transactionManager: TransactionManager
): ContractHandlerType => {
  return {
    transactionManager: transactionManager,
    animalDominance: {},
    gameManager: {},
    trading: {},
    playGameFactory: {},
    playGame: {},
    playActionLib: {},
    playBot: {},
  }
}

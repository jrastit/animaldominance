import { BigNumber } from 'ethers'

import {
  ContractAnimalDominance,
  ContractGameManager,
  ContractTrading,
  ContractNFT,
  ContractPlayBot,
  ContractPlayGameFactory,
  ContractPlayActionLib,
  ContractPlayGame,
  ContractCardList,
  ContractGameList,
} from '../contract/solidity/compiled/contractAutoFactory'

import {
  TransactionManager
} from '../util/TransactionManager'

export type ContractType<Contract> = {
  name: string
  contract?: Contract
  contractHash?: BigNumber | undefined
  versionOk?: boolean | undefined
  getContract: () => Contract
}

export type ContractHandlerType = {
  transactionManager: TransactionManager
  animalDominance: ContractType<ContractAnimalDominance>
  gameManager: ContractType<ContractGameManager>
  cardList: ContractType<ContractCardList>
  gameList: ContractType<ContractGameList>

  trading: ContractType<ContractTrading>
  nft: ContractType<ContractNFT>

  playGameFactory: ContractType<ContractPlayGameFactory>
  playGame: ContractType<ContractPlayGame>
  playActionLib: ContractType<ContractPlayActionLib>

  playBot: ContractType<ContractPlayBot>

}

class newContract<Contract>{
  name: string
  contract?: Contract
  contractHash?: BigNumber | undefined
  versionOk?: boolean | undefined
  getContract() {
    if (this.contract && this.versionOk)
      return this.contract
    throw Error("Contract " + this.name + " not set")
  }
  constructor(name: string) {
    this.name = name
  }
}

export const newContractHandler = (
  transactionManager: TransactionManager
): ContractHandlerType => {
  return {
    transactionManager: transactionManager,
    animalDominance: new newContract<ContractAnimalDominance>("Animal Dominance"),
    gameManager: new newContract<ContractGameManager>("Game Manager"),
    trading: new newContract<ContractTrading>("Trading"),
    nft: new newContract<ContractNFT>("NFT"),
    playGameFactory: new newContract<ContractPlayGameFactory>("Play Game Factory"),
    playGame: new newContract<ContractPlayGame>("Play Game"),
    playActionLib: new newContract<ContractPlayActionLib>("Play Action Lib"),
    playBot: new newContract<ContractPlayBot>("Play Bot"),
    cardList: new newContract<ContractCardList>("Card List"),
    gameList: new newContract<ContractGameList>("Game List"),
  }
}

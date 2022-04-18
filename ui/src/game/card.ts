import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import type {
  CardType,
    CardLevelType
} from '../type/cardType'

export const createAllCard = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager
) => {
  let cardFile = require("../card/card.json")
  await Promise.all(cardFile.card.map(async (card: any) => {
    const tx = await transactionManager.sendTx(await contract.populateTransaction.createCard(
      card.name,
      card.mana,
      card.family,
      card.starter
    ), "Create card " + card.name)
    //console.log(tx.logs)
    //console.log(contract.interface.parseLog(tx.logs[0]))

    await Promise.all(tx.logs.map(async (log) => {
      const log2 = contract.interface.parseLog(log)
      if (log2.name === 'CardCreated') {
        await Promise.all(card.level.map(async (level: any, l: number) => {
          await transactionManager.sendTx(await contract.populateTransaction.setCardLevel(
            log2.args.id,
            level.desc,
            l,
            level.life,
            level.attack,
          ), "Add level " + card.name + " : " + l + " => " + level.desc)
        }))
      }
    }))
  }))
}

export const loadAllCard = async (contract: ethers.Contract) => {
  const cardId = (await contract.cardId()).toNumber()
  //console.log(cardId)
  const cardList = [] as Array<CardType>
  for (let i = 1; i <= cardId; i++) {
    const cardChain = (await contract.cardList(i))
    //console.log(cardChain)
    const card = {
      id: cardChain.id.toNumber(),
      name: cardChain.name,
      mana: cardChain.mana.toNumber(),
      family: cardChain.family.toNumber(),
      starter: cardChain.starter.toNumber(),
      level: [] as Array<CardLevelType>
    } as CardType
    for (let j = 0; j < 6; j++) {
      const levelChain = (await contract.getCardLevel(i, j))
      const level = {
        description: levelChain.description,
        life: levelChain.life.toNumber(),
        attack: levelChain.attack.toNumber(),
      } as CardLevelType
      card.level.push(level)
    }
    cardList.push(card)
    //console.log(card)
  }
  return cardList
}

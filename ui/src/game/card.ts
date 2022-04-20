import * as ethers from 'ethers'

import { TransactionManager, TransactionItem } from '../util/TransactionManager'

import type {
  CardType,
    CardLevelType
} from '../type/cardType'

const DEF_DELAY = 1000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

export const createAllCard = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  setMessage?: (msg: string | undefined) => void,
) => {
  let cardFile = require("../card/card.json")
  for (let i = 0; i < cardFile.card.length; i++) {
    const card = cardFile.card[i]
    const tx = await transactionManager.sendTx(await contract.populateTransaction.createCard(
      card.name,
      card.mana,
      card.family,
      card.starter
    ), "Create card " + card.name)
    if (setMessage) setMessage(tx.log)
    await Promise.all(tx.result.logs.map(async (log) => {
      const log2 = contract.interface.parseLog(log)
      if (log2.name === 'CardCreated') {
        const promise = [] as Array<Promise<TransactionItem>>
        for (let l = 0; l < card.level.length; l++) {
          const level = card.level[l]
          promise.push(transactionManager.sendTx(await contract.populateTransaction.setCardLevel(
            log2.args.id,
            level.desc,
            l,
            level.life,
            level.attack,
          ), "Add level " + card.name + " : " + l + " => " + level.desc))
          await sleep(200)
        }
        await Promise.all(promise)
      }
    }))
  }
  /*
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
  */
}

export const loadAllCard = async (
  contract: ethers.Contract,
  setMessage?: (message: string | undefined) => void
) => {
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
      if (setMessage) setMessage("Loading card " + (i * 6 + j + 1) + "/" + ((cardId + 1) * 6) + " " + card.name)
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

export const loadAllCardFromFile = async () => {
  let cardFile = require("../card/card.json")
  return cardFile.card.map((card: any, id: number) => {
    return {
      id: id,
      name: card.name,
      mana: card.mana,
      family: card.family,
      starter: card.starter,
      level: card.level.map((cardLevel: any) => {
        return {
          description: cardLevel.description,
          life: cardLevel.life,
          attack: cardLevel.attack,
        } as CardLevelType
      })
    } as CardType
  })
}

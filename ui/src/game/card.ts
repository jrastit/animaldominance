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
  speed?: number,
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
          const tx2 = transactionManager.sendTx(await contract.populateTransaction.setCardLevel(
            log2.args.id,
            level.desc,
            l,
            level.life,
            level.attack,
          ), "Add level " + card.name + " : " + l + " => " + level.desc)
          await tx2
          if (speed) {
            promise.push(tx2)
            await sleep(200)
          } else {
            if (setMessage) setMessage((await tx2).log)
          }

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

export const getCardId = async (
  contract: ethers.Contract,
) => {
  return (await contract.cardId())
}

export const loadAllCard = async (
  contract: ethers.Contract,
  setMessage?: (message: string | undefined) => void,
) => {
  const cardId = await getCardId(contract)
  //console.log(cardId)
  const cardList = [] as Array<CardType>
  for (let i = 1; i <= cardId; i++) {
    const cardChain = (await contract.cardList(i))
    //console.log(cardChain)
    const card = {
      id: cardChain.id,
      name: cardChain.name,
      mana: cardChain.mana,
      family: cardChain.family,
      starter: cardChain.starter,
      level: [] as Array<CardLevelType>
    } as CardType
    for (let j = 0; j < 6; j++) {
      if (setMessage) setMessage("Loading card " + ((i - 1) * 6 + j + 1) + "/" + (cardId * 6) + " " + card.name)
      const levelChain = (await contract.getCardLevel(i, j))
      const level = {
        description: levelChain.description,
        life: levelChain.life,
        attack: levelChain.attack,
      } as CardLevelType
      card.level.push(level)
    }
    cardList.push(card)

    //console.log(card)
  }
  return cardList
}

export const loadAllCardFromFile = () => {
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

export const getLevel = (exp: number) => {
  if (exp > 100000) return 5
  if (exp > 10000) return 4
  if (exp > 1000) return 3
  if (exp > 100) return 2
  if (exp > 10) return 1
  return 0
}

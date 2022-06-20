import { utils as ethersUtils, BigNumber } from 'ethers'

import { TransactionItem } from '../util/TransactionManager'
import { ContractHandlerType } from '../type/contractType'

import {
  CardType,
  CardLevelType
} from '../type/cardType'

const DEF_DELAY = 1000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

export const createAllCard = async (
  contractHandler: ContractHandlerType,
  setMessage?: (msg: string | undefined) => void,
  speed?: number,
) => {
  let cardFile = require("../card/card.json")
  const cardLastId = await getCardLastId(contractHandler)
  for (let i = cardLastId; i < cardFile.card.length; i++) {
    const card = cardFile.card[i]
    if (1) {
      const description = [] as string[]
      const attack = [] as number[]
      const life = [] as number[]
      card.level.forEach((level: any) => {
        description.push(level.description)
        attack.push(level.attack)
        life.push(level.life)
      });
      const tx = await contractHandler.cardList.getContract().createCardFull(
        card.name,
        card.mana,
        card.family,
        card.starter,
        description,
        life,
        attack,
      );
      if (setMessage) setMessage(tx.log + ' ' + card.name)
    } else {
      const tx = await contractHandler.cardList.getContract().createCard(
        card.name,
        card.mana,
        card.family,
        card.starter
      )
      if (setMessage) setMessage(tx.log)
      await Promise.all(tx.result.logs.map(async (log: any) => {
        const log2 = contractHandler.cardList.getContract().interface.parseLog(log)
        if (log2.name === 'CardCreated') {
          const promise = [] as Array<Promise<TransactionItem>>
          for (let l = 0; l < card.level.length; l++) {
            const level = card.level[l]
            const tx2 = await contractHandler.cardList.getContract().setCardLevel(
              log2.args.id,
              level.description,
              l,
              level.life,
              level.attack,
            )
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
  }
  const cardHash = BigNumber.from(ethersUtils.id(JSON.stringify(cardFile)))
  await contractHandler.cardList.getContract().setCardHash(cardHash)
}

export const buyNewCard = async (
  contractHandler: ContractHandlerType,
  cardId: number,
  value: BigNumber,
) => {
  return await contractHandler.gameManager.getContract().buyNewCard(
    cardId,
    { value }
  )
}

export const buyCard = async (
  contractHandler: ContractHandlerType,
  userId: number,
  userCardId: number,
  value: BigNumber,
) => {
  return await contractHandler.gameManager.getContract().buyCard(
    userId,
    userCardId,
    { value }
  )
}

export const listCard = async (
  contractHandler: ContractHandlerType,
  cardId: number,
  price: number,
) => {
  return await contractHandler.gameManager.getContract().sellCardSelf(
    cardId,
    ethersUtils.parseEther(price.toString()),
  )
}

export const cancelListCard = async (
  contractHandler: ContractHandlerType,
  cardId: number,
) => {
  return await contractHandler.gameManager.getContract().cancelSellCardSelf(
    cardId,
  )
}

export const getCardLastId = async (
  contractHandler: ContractHandlerType,
) => {
  return (await contractHandler.cardList.getContract().cardLastId())[0]
}

export const loadAllCard = async (
  contractHandler: ContractHandlerType,
  setMessage?: (message: string | undefined) => void,
) => {
  const _cardHash = (await contractHandler.cardList.getContract().cardHash())[0]
  if (_cardHash) {
    let cardFile = require("../card/card.json")
    const cardHash = BigNumber.from(ethersUtils.id(JSON.stringify(cardFile)))
    if (cardHash.eq(_cardHash)) {
      return loadAllCardFromFile()
    }
  }
  const cardLastId = await getCardLastId(contractHandler)
  //console.log(cardId)
  const cardList = [] as Array<CardType>
  for (let i = 1; i <= cardLastId; i++) {
    const cardChain = (await contractHandler.cardList.getContract().cardList(i))
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
      if (setMessage) setMessage("Loading card " + ((i - 1) * 6 + j + 1) + "/" + (cardLastId * 6) + " " + card.name)
      const levelChain = (await contractHandler.cardList.getContract().getCardLevel(i, j))[0]
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
      id: id + 1,
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
  if (exp >= 100000) return 5
  if (exp >= 10000) return 4
  if (exp >= 1000) return 3
  if (exp >= 100) return 2
  if (exp >= 10) return 1
  return 0
}

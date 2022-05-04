import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  UserType,
  UserDeckType,
  UserCardType,
} from '../type/userType'

export const registerUser = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  name: string,
) => {
  const tx = await transactionManager.sendTx(await contract.populateTransaction.registerUserSelf(
    name
  ), "Register user as " + name)
  return tx
}

export const getUserId = async (
  contract: ethers.Contract,
  address?: string,
) => {
  if (!address) {
    address = await contract.signer.getAddress()
  }
  const idBG = await contract.userAddressList(address)
  //console.log(ethers.BigNumber.from(idBG).toNumber())

  return ethers.BigNumber.from(idBG).toNumber()
}

export const getUser = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const userChain = await contract.userIdList(userId)
  return {
    id: userChain.id.toNumber(),
    name: userChain.name,
    totem: userChain.totem,
    rank: userChain.rank.toNumber(),
    gameId: userChain.gameId.toNumber(),
  } as UserType
}

export const getUserCardList = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const cardListChain = await contract.getUserCardList(userId)
  return cardListChain.map((userCardChain: any, id: number) => {
    return {
      id: id + 1,
      cardId: userCardChain.cardId,
      exp: userCardChain.exp.toNumber(),
    } as UserCardType
  })
}

export const getUserDeckList = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const deckLength = await contract.getUserDeckLength(userId)
  const userDeckList = [] as UserDeckType[]
  for (let i = 1; i <= deckLength; i++) {
    const gameDeckCardChain = await contract.getUserDeckCard(userId, i)
    userDeckList.push({
      id: i,
      userCardIdList: gameDeckCardChain,
    })
  }
  return userDeckList
}

export const addUserDefaultDeck = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userCardList: UserCardType[],
) => {
  if (userCardList.length < 20) {
    throw new Error("Not enought card")
  }
  const deckCardList = userCardList.slice(0, 20)
  return await addUserDeck(contract, transactionManager, deckCardList)
}

export const addUserDeck = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 20) {
    throw new Error("Should have 20 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  const tx = await transactionManager.sendTx(await contract.populateTransaction.addGameDeckSelf(
    deckCardIdList,
  ), "Add default deck")
  let deckId = 0
  await Promise.all(tx.result.logs.map(async (log) => {
    const log2 = contract.interface.parseLog(log)
    if (log2.name === 'DeckUpdated') {
      deckId = log2.args.deckId
    }
  }))
  return {
    id: deckId,
    userCardIdList: deckCardIdList,
  } as UserDeckType
}

export const updateUserDeck = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  deckId: number,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 20) {
    throw new Error("Should have 20 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  await transactionManager.sendTx(await contract.populateTransaction.updateGameDeckSelf(
    deckId,
    deckCardIdList,
  ), "Update deck " + deckId)
  return {
    id: deckId,
    userCardIdList: deckCardIdList,
  } as UserDeckType
}

export const addUserStarterCard = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userId: number,
) => {
  const tx = await transactionManager.sendTx(
    await contract.populateTransaction.addUserStarterCard(
      userId
    ), "Add user starter cards")
  return tx
}

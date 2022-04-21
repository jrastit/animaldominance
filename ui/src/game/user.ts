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
    totem: userChain.totem.toNumber(),
    rank: userChain.rank.toNumber(),
  } as UserType
}

export const getUserCardList = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const cardListChain = await contract.getUserCardList(userId)
  return cardListChain.map((userCardChain: any, id: number) => {
    return {
      id: id,
      cardId: userCardChain.cardId.toNumber(),
      exp: userCardChain.exp.toNumber(),
    }
  })
}

export const getUserDeckList = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const deckLength = ethers.BigNumber.from(
    await contract.getUserGameDeckLength(userId)
  ).toNumber()
  const userDeckList = [] as UserDeckType[]
  for (let i = 0; i < deckLength; i++) {
    const gameDeckCardChain = await contract.getUserGameDeckCard(userId, i) as ethers.BigNumber[]
    userDeckList.push({
      id: i,
      userCardIdList: gameDeckCardChain.map(nb => nb.toNumber()),
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
  const deckCardList = userCardList.slice(0, 20).map(userCard => userCard.id)
  const tx = await transactionManager.sendTx(await contract.populateTransaction.addGameDeckSelf(
    deckCardList,
  ), "Add default deck")
  return tx
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

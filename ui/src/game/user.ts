import { utils as ethersUtils } from 'ethers'
import { ContractCardAdmin } from '../contract/solidity/compiled/contractAutoFactory'

import {
  UserType,
  UserDeckType,
  UserCardType,
} from '../type/userType'

export const registerUser = async (
  contract: ContractCardAdmin,
  name: string,
) => {
  const tx = await contract.registerUserSelf(
    name
  )
  return tx
}

export const getUserId = async (
  contract: ContractCardAdmin,
  address?: string,
) => {
  if (!address) {
    address = await contract.signer.getAddress()
  }
  const idBG = await contract.userAddressList(address)
  return idBG[0].toNumber()
}

export const getUser = async (
  contract: ContractCardAdmin,
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
  contract: ContractCardAdmin,
  userId: number,
) => {
  const cardListChain = await contract.getUserCardList(userId)
  return cardListChain.userCard.map((userCardChain: any, id: number) => {
    return {
      id: id + 1,
      cardId: userCardChain.cardId,
      exp: userCardChain.exp.toNumber(),
      expWin: userCardChain.expWin.toNumber(),
      price: parseFloat(ethersUtils.formatEther(userCardChain.price)),
      sold: userCardChain.sold,
    } as UserCardType
  })
}

export const getUserDeckList = async (
  contract: ContractCardAdmin,
  userId: number,
) => {
  const deckLength = await contract.getUserDeckLength(userId)
  const userDeckList = [] as UserDeckType[]
  for (let i = 1; i <= deckLength; i++) {
    const gameDeckCardChain = (await contract.getUserDeckCard(userId, i))[0]
    userDeckList.push({
      id: i,
      userCardIdList: gameDeckCardChain,
    })
  }
  return userDeckList
}

export const addUserDefaultDeck = async (
  contract: ContractCardAdmin,
  userCardList: UserCardType[],
) => {
  if (userCardList.length < 20) {
    throw new Error("Not enought card")
  }
  const deckCardList = userCardList.slice(0, 20)
  return await addUserDeck(contract, deckCardList)
}

export const addUserDeck = async (
  contract: ContractCardAdmin,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 20) {
    throw new Error("Should have 20 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  const tx = await contract.addGameDeckSelf(
    deckCardIdList,
  )
  let deckId = 0
  await Promise.all(tx.result.logs.map(async (log: any) => {
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
  contract: ContractCardAdmin,
  deckId: number,
  userCardList: UserCardType[],
) => {
  if (userCardList.length !== 20) {
    throw new Error("Should have 20 cards")
  }
  const deckCardIdList = userCardList.map(userCard => userCard.id)
  await contract.updateGameDeckSelf(
    deckId,
    deckCardIdList,
  )
  return {
    id: deckId,
    userCardIdList: deckCardIdList,
  } as UserDeckType
}

export const addUserStarterCard = async (
  contract: ContractCardAdmin,
  userId: number,
) => {
  return await contract.addUserStarterCard(
    userId
  )
}

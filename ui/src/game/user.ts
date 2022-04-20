import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import type {
  UserType,
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
  console.log("get user id from " + address)
  const idBG = await contract.userAddressList(address)
  console.log(ethers.BigNumber.from(idBG).toNumber())

  return ethers.BigNumber.from(idBG).toNumber()
}

export const getUser = async (
  contract: ethers.Contract,
  userId: number,
) => {
  const userChain = await contract.userIdList(userId)
  //console.log(userChain)
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
  //console.log(cardListChain)
  return cardListChain.map((userCardChain: any, id: number) => {
    return {
      id: id,
      cardId: userCardChain.cardId.toNumber(),
      exp: userCardChain.exp.toNumber(),
    }
  })
}

export const addUserStarterCard = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userId: number,
) => {
  console.log(userId)
  const tx = await transactionManager.sendTx(
    await contract.populateTransaction.addUserStarterCard(
      userId
    ), "Add user starter cards")
  return tx
}

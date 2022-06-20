import { BigNumber } from 'ethers'

import { ContractHandlerType } from '../type/contractType'

import {
  GameListItemType,
} from '../type/gameType'

import {
  getHashContractPlayBot,
} from './contract/contractHash'

export const getGameLastId = async (
  contractHandler: ContractHandlerType,
) => {
  const result = await contractHandler.gameList.getContract().gameLastId()
  return result[0].toNumber()
}

export const getGame = async (
  contractHandler: ContractHandlerType,
  gameId: number
) => {
  const gameChain = await contractHandler.gameList.getContract().gameList(gameId)
  return {
    id: gameId,
    userId1: gameChain.userId1.toNumber(),
    userId2: gameChain.userId2.toNumber(),
    userDeck1: gameChain.userDeck1,
    userDeck2: gameChain.userDeck2,
    winner: gameChain.winner.toNumber(),
    ended: gameChain.ended,
    playGame: gameChain.playGame,
  } as GameListItemType
}

export const getGameId = async (
  userId: number,
  contractHandler: ContractHandlerType,
) => {
  return (await contractHandler.gameList.getContract().gameUserList(userId))[0].toNumber()
}

export const getGameList = async (
  contractHandler: ContractHandlerType,
) => {
  const lastId = await getGameLastId(contractHandler)
  const gameList = [] as GameListItemType[]
  for (let i = 1; i <= lastId; i++) {
    gameList.push(await getGame(contractHandler, i))
  }
  return gameList
}

export const createGame = async (
  contractHandler: ContractHandlerType,
  userDeckId: number,
) => {
  const tx = await contractHandler.gameList.getContract().createGameSelf(
    userDeckId
  )
  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = contractHandler.gameList.getContract().interface.parseLog(tx.result.logs[i])
    if (log.name === 'GameCreated') {
      return log.args.id.toNumber()
    }
  }
  throw Error('Game id not found')
}

export const createGameBot = async (
  contractHandler: ContractHandlerType,
  userDeckId: number,
) => {
  const tx = await contractHandler.gameList.getContract().createGameBotSelf(
    userDeckId,
    BigNumber.from(getHashContractPlayBot()),
  )
  for (let i = 0; i < tx.result.logs.length; i++) {
    try {
      const log = contractHandler.gameList.getContract().interface.parseLog(tx.result.logs[i])
      if (log.name === 'GameCreatedBot') {
        return log.args.id.toNumber()
      }
    } catch (err) {
      console.log('no maching event')
    }
  }
  throw Error('Game id not found')
}

export const joinGame = async (
  contractHandler: ContractHandlerType,
  gameId: number,
  userDeckId: number,
) => {
  return contractHandler.gameList.getContract().joinGameSelf(
    gameId,
    userDeckId,
  )
}

export const cancelGame = async (
  contractHandler: ContractHandlerType,
) => {
  return await await contractHandler.gameList.getContract().cancelGame()
}

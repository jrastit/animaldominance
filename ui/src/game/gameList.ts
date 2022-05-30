import { ContractCardAdmin } from '../contract/solidity/compiled/contractAutoFactory'
import { BigNumber } from 'ethers'

import {
  GameListItemType,
} from '../type/gameType'


export const getGameLastId = async (
  contract: ContractCardAdmin,
) => {
  return BigNumber.from(await contract.gameLastId()).toNumber()
}

export const getGame = async (
  contract: ContractCardAdmin,
  gameId: number
) => {
  const gameChain = await contract.gameList(gameId)
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

export const getGameList = async (
  contract: ContractCardAdmin,
) => {
  const lastId = await getGameLastId(contract)
  const gameList = [] as GameListItemType[]
  for (let i = 1; i <= lastId; i++) {
    gameList.push(await getGame(contract, i))
  }
  return gameList
}

export const createGame = async (
  contract: ContractCardAdmin,
  userDeckId: number,
) => {
  const tx = await contract.createGameSelf(
    userDeckId
  )
  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = contract.interface.parseLog(tx.result.logs[i])
    if (log.name === 'GameCreated') {
      return log.args.id.toNumber()
    }
  }
  throw Error('Game id not found')
}

export const createGameBot = async (
  contract: ContractCardAdmin,
  userDeckId: number,
) => {
  const tx = await contract.createGameBotSelf(
    userDeckId
  )
  for (let i = 0; i < tx.result.logs.length; i++) {
    try {
      const log = contract.interface.parseLog(tx.result.logs[i])
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
  contract: ContractCardAdmin,
  gameId: number,
  userDeckId: number,
) => {
  return contract.joinGameSelf(
    gameId,
    userDeckId,
  )
}

export const cancelGame = async (
  contract: ContractCardAdmin,
) => {
  return await await contract.cancelGame()
}

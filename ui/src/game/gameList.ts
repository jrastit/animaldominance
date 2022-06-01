import { ContractGameManager } from '../contract/solidity/compiled/contractAutoFactory'

import {
  GameListItemType,
} from '../type/gameType'


export const getGameLastId = async (
  contract: ContractGameManager,
) => {
  const result = await contract.gameLastId()
  return result[0].toNumber()
}

export const getGame = async (
  contract: ContractGameManager,
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
  contract: ContractGameManager,
) => {
  const lastId = await getGameLastId(contract)
  const gameList = [] as GameListItemType[]
  for (let i = 1; i <= lastId; i++) {
    gameList.push(await getGame(contract, i))
  }
  return gameList
}

export const createGame = async (
  contract: ContractGameManager,
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
  contract: ContractGameManager,
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
  contract: ContractGameManager,
  gameId: number,
  userDeckId: number,
) => {
  return contract.joinGameSelf(
    gameId,
    userDeckId,
  )
}

export const cancelGame = async (
  contract: ContractGameManager,
) => {
  return await await contract.cancelGame()
}

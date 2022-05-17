import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  GameListItemType,
} from '../type/gameType'


export const getGameLastId = async (
  contract: ethers.Contract,
) => {
  return ethers.BigNumber.from(await contract.gameLastId()).toNumber()
}

export const getGame = async (
  contract: ethers.Contract,
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
  contract: ethers.Contract,
) => {
  const lastId = await getGameLastId(contract)
  const gameList = [] as GameListItemType[]
  for (let i = 1; i <= lastId; i++) {
    gameList.push(await getGame(contract, i))
  }
  return gameList
}

export const createGame = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userDeckId: number,
) => {
  const tx = await transactionManager.sendTx(await contract.populateTransaction.createGameSelf(
    userDeckId
  ), "Create game")
  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = contract.interface.parseLog(tx.result.logs[i])
    if (log.name === 'GameCreated') {
      return log.args.id.toNumber()
    }
  }
  throw Error('Game id not found')
}

export const createGameBot = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userDeckId: number,
) => {
  const tx = await transactionManager.sendTx(await contract.populateTransaction.createGameBotSelf(
    userDeckId
  ), "Create game bot")
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
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  gameId: number,
  userDeckId: number,
) => {
  const tx = await transactionManager.sendTx(
    await contract.populateTransaction.joinGameSelf(
      gameId,
      userDeckId,
    ), "Join game"
  )
  return tx
}

export const cancelGame = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
) => {
  const tx = await transactionManager.sendTx(
    await contract.populateTransaction.cancelGame(
    ), "Cancel game"
  )
  return tx
}

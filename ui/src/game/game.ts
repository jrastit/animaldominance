import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  GameListItemType,
  GameCardType,
} from '../type/gameType'

export const getGameId = async (
  contract: ethers.Contract,
) => {
  return ethers.BigNumber.from(await contract.gameId()).toNumber()
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
    userDeck1: gameChain.userDeck1.toNumber(),
    userDeck2: gameChain.userDeck2.toNumber(),
  } as GameListItemType
}

export const getGameCardList = async (
  contract: ethers.Contract,
  gameId: number,
  pos: boolean
) => {
  return (await contract.getGameCard(gameId, pos)).map((gameCardListChain: any) => {
    return {
      userId: gameCardListChain.userId.toNumber(),
      userCardId: gameCardListChain.userCardId.toNumber(),
      cardId: gameCardListChain.cardId.toNumber(),
      life: gameCardListChain.life.toNumber(),
      attack: gameCardListChain.attack.toNumber(),
      mana: gameCardListChain.mana.toNumber(),
      position: gameCardListChain.position.toNumber(),
    }
  }) as GameCardType[]
}

/*
export const getGameFull = async (
  contract: ethers.Contract,
  gameId: number
) => {
  const game = await getGame(contract, gameId)
  if (game.userId1) {
    game.cardList1 = await getGameCardList(contract, gameId, true)
  }
  if (game.userId1) {
    game.cardList2 = await getGameCardList(contract, gameId, false)
  }
  return game
}
*/

export const getGameList = async (
  contract: ethers.Contract,
) => {
  const id = await getGameId(contract)
  const gameList = [] as GameListItemType[]
  for (let i = 1; i <= id; i++) {
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
  const gameId = await Promise.all(tx.result.logs.map(async (log) => {
    const log2 = contract.interface.parseLog(log)
    if (log2.name === 'GameCreated') {
      return log2.args.id.toNumber()
    }
  }))
  return gameId[0]
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
    ), "Create game"
  )
  return tx
}

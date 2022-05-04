import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  GameListItemType,
  GameCardType,
  GameType
} from '../type/gameType'

import {
  getContractPlayGame
} from '../contract/solidity/compiled/contractAutoFactory'

export const getGameLastId = async (
  contract: ethers.Contract,
) => {
  return ethers.BigNumber.from(await contract.gameLastId()).toNumber()
}

export const getGameContract = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  gameId: number
) => {
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  console.log(contractAddress)
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    return undefined
  }
  return getContractPlayGame(contractAddress, transactionManager.signer)
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
  } as GameListItemType
}

export const getGameCardList = async (
  gameContract: ethers.Contract,
  pos: number
) => {
  return (await gameContract.getGameCardList(pos)).map((gameCardListChain: any, id: number) => {
    return {
      id,
      userId: gameCardListChain.userId.toNumber(),
      userCardId: gameCardListChain.userCardId,
      cardId: gameCardListChain.cardId,
      life: gameCardListChain.life,
      attack: gameCardListChain.attack,
      mana: gameCardListChain.mana,
      position: gameCardListChain.position,
      exp: gameCardListChain.exp.toNumber(),
      expWin: gameCardListChain.expWin.toNumber(),
      play: 0,
    }
  }) as GameCardType[]
}


export const getGameFull = async (
  gameContract: ethers.Contract,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load id ')
  const id = ethers.BigNumber.from(await gameContract.gameId()).toNumber()
  setMessage && setMessage('Load user1 id ')
  const gameUser1 = await gameContract.gameUser(0)
  const userId1 = ethers.BigNumber.from(gameUser1.userId).toNumber()
  const life1 = ethers.BigNumber.from(gameUser1.life).toNumber()
  setMessage && setMessage('Load user2 id ')
  const gameUser2 = await gameContract.gameUser(1)
  const userId2 = ethers.BigNumber.from(gameUser2.userId).toNumber()
  const life2 = ethers.BigNumber.from(gameUser2.life).toNumber()
  setMessage && setMessage('Load user1 card ')
  const cardList1 = await getGameCardList(gameContract, 0)
  setMessage && setMessage('Load user2 card ')
  const cardList2 = await getGameCardList(gameContract, 1)
  setMessage && setMessage('Load latest time ')
  const latestTime = ethers.BigNumber.from(await gameContract.latestTime()).toNumber()
  setMessage && setMessage('Load version ')
  const version = await gameContract.version()
  setMessage && setMessage('Load turn ')
  const turn = await gameContract.turn()
  setMessage && setMessage('Load winner ')
  const winner = ethers.BigNumber.from(await gameContract.winner()).toNumber()
  const game = {
    id,
    userId1,
    userId2,
    life1,
    life2,
    cardList1,
    cardList2,
    latestTime,
    version,
    turn,
    winner,
  } as GameType
  return game
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
  const gameId = await Promise.all(tx.result.logs.map(async (log) => {
    const log2 = contract.interface.parseLog(log)
    if (log2.name === 'GameCreated') {
      return log2.args.id.toNumber()
    }
  }))
  return gameId[0] as number
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

export const endTurn = async (
  gameContract: ethers.Contract,
  transactionManager: TransactionManager,
  playActionList: number[][],
  turn: number,
) => {
  const tx = await transactionManager.sendTx(
    await gameContract.populateTransaction.endTurn(
      playActionList,
    ), "Play turn " + turn
  )
  return tx
}

export const endGameByTime = async (
  gameContract: ethers.Contract,
  transactionManager: TransactionManager,
) => {
  const tx = await transactionManager.sendTx(
    await gameContract.populateTransaction.endGameByTime(

    ), "End game by time"
  )
  return tx
}

export const leaveGame = async (
  gameContract: ethers.Contract,
  transactionManager: TransactionManager,
) => {
  const tx = await transactionManager.sendTx(
    await gameContract.populateTransaction.leaveGame(

    ), "Leave game"
  )
  return tx
}

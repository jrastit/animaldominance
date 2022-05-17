import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import {
  GameCardType,
  GameType
} from '../type/gameType'

import {
  getContractPlayGame
} from '../contract/solidity/compiled/contractAutoFactory'

export const getGameContract = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  gameId: number
) => {
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    return undefined
  }
  return getContractPlayGame(contractAddress, transactionManager.signer)
}

export const getGameCardFromChain = (
  gameCardListChain: any,
  id: number,
) => {
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
}

export const getGameCardList = async (
  gameContract: ethers.Contract,
  pos: number
) => {
  return (await gameContract.getGameCardList(pos)).map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
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
  setMessage && setMessage('Load ended ')
  const ended = await gameContract.ended()
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
    ended,
  } as GameType
  return game
}

export const endTurn = async (
  gameContract: ethers.Contract,
  transactionManager: TransactionManager,
  playActionList: number[][],
  turn: number,
  cardNextId0: number,
  cardNextId1: number,
  addPlayAction?: (payload: {
    turn: number,
    actionId: number,
    data: number[]
  }) => void,
) => {
  const cardList0 = [] as GameCardType[]
  const cardList1 = [] as GameCardType[]
  const tx = await transactionManager.sendTx(
    await gameContract.populateTransaction.endTurn(
      playActionList,
    ), "Play turn " + turn
  )

  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = gameContract.interface.parseLog(tx.result.logs[i])
    if (log.name === 'PlayAction' && addPlayAction) {
      if (log.args.turn === turn + 1) {
        addPlayAction({
          turn: log.args.turn,
          actionId: log.args.id,
          data: [log.args.gameCard, log.args.dest, log.args.result]
        })
      }
    }
    if (log.name === 'DrawCard') {
      if (log.args.turn === turn + 1) {
        const gameCard = getGameCardFromChain(log.args.gameCard, cardNextId1)
        cardNextId1++
        cardList1.push(gameCard)
      }
      if (log.args.turn === turn + 2) {
        const gameCard = getGameCardFromChain(log.args.gameCard, cardNextId0)
        cardNextId0++
        cardList0.push(gameCard)
      }
    }
  }
  return {
    cardList0,
    cardList1,
  }
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

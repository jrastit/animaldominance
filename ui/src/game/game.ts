import { BigNumber } from 'ethers'
import { ContractPlayGame } from '../contract/solidity/compiled/contractAutoFactory'
import { ContractGameManager } from '../contract/solidity/compiled/contractAutoFactory'

import {
  GameCardType,
  GameType,
  GameActionType,
  GameActionListType,
  GameActionPayloadType,
} from '../type/gameType'

import {
  getWithManagerContractPlayGame
} from '../contract/solidity/compiled/contractAutoFactory'

export const getGameContract = async (
  contract: ContractGameManager,
  gameId: number
) => {
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    return undefined
  }
  return getWithManagerContractPlayGame(contractAddress, contract.transactionManager)
}

export const getGameCardFromChain = (
  gameCardListChain: any,
  id: number,
) => {
  if (!gameCardListChain.cardId) return undefined
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
  gameContract: ContractPlayGame,
  pos: number
) => {
  return ((await gameContract.getGameCardList(pos))[0]).map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
  }) as GameCardType[]
}

export const getNewGameCardFromId = async (
  gameContract: ContractPlayGame,
  userId: number,
  gameCardId: number
) => {
  const gameCardListChain = (await gameContract.getNewGameCardFromId(userId, gameCardId))[0]
  if (!gameCardListChain || !gameCardListChain.cardId) {
    throw Error('Invalid card ' + gameCardId + '/' + userId)
  }

  return getGameCardFromChain(gameCardListChain, gameCardId)
}

export const getGameFull = async (
  gameContract: ContractPlayGame,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load game ')
  const gameFull = await gameContract.getGameFull()
  const id = gameFull[0].toNumber()
  const userId1 = gameFull[1].toNumber()
  const userId2 = gameFull[2].toNumber()
  const life1 = gameFull[3]
  const life2 = gameFull[4]
  const cardList1 = gameFull[7].map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
  }) as GameCardType[]
  const cardList2 = gameFull[8].map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
  }) as GameCardType[]
  const latestTime = gameFull[9].toNumber()
  const version = gameFull[10]
  const turn = gameFull[11]
  const winner = gameFull[12].toNumber()
  const ended = gameFull[13]
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

export const getGameFull2 = async (
  gameContract: ContractPlayGame,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load id ')
  const id = (await gameContract.gameId())[0].toNumber()
  setMessage && setMessage('Load user1 id ')
  const gameUser1 = await gameContract.gameUser(0)
  const userId1 = BigNumber.from(gameUser1.userId).toNumber()
  const life1 = BigNumber.from(gameUser1.life).toNumber()
  setMessage && setMessage('Load user2 id ')
  const gameUser2 = await gameContract.gameUser(1)
  const userId2 = BigNumber.from(gameUser2.userId).toNumber()
  const life2 = BigNumber.from(gameUser2.life).toNumber()
  setMessage && setMessage('Load user1 card ')
  const cardList1 = await getGameCardList(gameContract, 0)
  setMessage && setMessage('Load user2 card ')
  const cardList2 = await getGameCardList(gameContract, 1)
  setMessage && setMessage('Load latest time ')
  const latestTime = (await gameContract.latestTime())[0].toNumber()
  setMessage && setMessage('Load version ')
  const version = (await gameContract.version())[0]
  setMessage && setMessage('Load turn ')
  const turn = (await gameContract.turn())[0]
  setMessage && setMessage('Load winner ')
  const winner = (await gameContract.winner())[0].toNumber()
  setMessage && setMessage('Load ended ')
  const ended = (await gameContract.ended())[0]
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
  gameContract: ContractPlayGame,
  playActionList: GameActionListType,
  turn: number,
  addPlayAction: (payload: GameActionPayloadType) => Promise<void>,
) => {
  const _playActionList = (
    playActionList.filter(
      gameAction => gameAction &&
        gameAction.actionTypeId
    ) as GameActionType[]
  ).map(
    gameAction => [
      gameAction.gameCardId,
      gameAction.actionTypeId,
      gameAction.dest,
    ]
  )
  //console.log("endTurn", turn, _playActionList)
  const tx = await gameContract.endTurn(
    turn,
    _playActionList,
  )

  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = gameContract.interface.parseLog(tx.result.logs[i])
    if (log.name === 'PlayAction' && addPlayAction) {
      /*
      console.log(
        log.args.turn,
        log.args.id,
        log.args.gameCardId,
        log.args.actionTypeId,
        log.args.dest,
        log.args.result,
      )
      */
      await addPlayAction({
        turn: log.args.turn,
        id: log.args.id,
        gameAction: {
          gameCardId: log.args.gameCardId,
          actionTypeId: log.args.actionTypeId,
          dest: log.args.dest,
          result: log.args.result
        }
      })
    }
  }
}

export const endGameByTime = async (
  gameContract: ContractPlayGame,
) => {
  const tx = await gameContract.endGameByTime(

  )
  return tx
}

export const leaveGame = async (
  gameContract: ContractPlayGame,
) => {

  return await gameContract.leaveGame(

  )
}

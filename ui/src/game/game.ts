import { BigNumber } from 'ethers'
import { ContractPlayGame } from '../contract/solidity/compiled/contractAutoFactory'
import { ContractCardAdmin } from '../contract/solidity/compiled/contractAutoFactory'

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
  contract: ContractCardAdmin,
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
  return (await gameContract.getGameCardList(pos)).map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
  }) as GameCardType[]
}

export const getNewGameCardFromId = async (
  gameContract: ContractPlayGame,
  userId: number,
  gameCardId: number
) => {
  const gameCardListChain = await gameContract.getNewGameCardFromId(userId, gameCardId)
  if (!gameCardListChain || !gameCardListChain.cardId) {
    throw Error('Invalid card ' + gameCardId + '/' + userId)
  }

  return getGameCardFromChain(gameCardListChain, gameCardId)
}

export const getGameFull = async (
  gameContract: ContractPlayGame,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load id ')
  const id = BigNumber.from(await gameContract.gameId()).toNumber()
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
  const latestTime = BigNumber.from(await gameContract.latestTime()).toNumber()
  setMessage && setMessage('Load version ')
  const version = await gameContract.version()
  setMessage && setMessage('Load turn ')
  const turn = await gameContract.turn()
  setMessage && setMessage('Load winner ')
  const winner = BigNumber.from(await gameContract.winner()).toNumber()
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

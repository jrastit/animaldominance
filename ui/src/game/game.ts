import { constants as ethersConstants, BigNumber } from 'ethers'

import { ContractHandlerType } from '../type/contractType'

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
  contractHandler: ContractHandlerType,
  gameId: number
) => {
  const gameChain = await contractHandler.gameList.getContract().gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress || contractAddress === ethersConstants.AddressZero) {
    return undefined
  }
  contractHandler.playGame.contract = getWithManagerContractPlayGame(contractAddress, contractHandler.transactionManager)
  contractHandler.playGame.versionOk = true
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
  contractHandler: ContractHandlerType,
  pos: number
) => {
  return ((await contractHandler.playGame.getContract().getGameCardList(pos))[0]).map((gameCardListChain: any, id: number) => {
    return getGameCardFromChain(gameCardListChain, id)
  }) as GameCardType[]
}

export const getNewGameCardFromId = async (
  contractHandler: ContractHandlerType,
  userId: number,
  gameCardId: number
) => {
  const gameCardListChain = (await contractHandler.playGame.getContract().getNewGameCardFromId(userId, gameCardId))[0]
  if (!gameCardListChain || !gameCardListChain.cardId) {
    throw Error('Invalid card ' + gameCardId + '/' + userId)
  }

  return getGameCardFromChain(gameCardListChain, gameCardId)
}

export const getGameFull = async (
  contractHandler: ContractHandlerType,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load game ')
  const gameFull = await contractHandler.playGame.getContract().getGameFull()
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
  contractHandler: ContractHandlerType,
  setMessage?: (message: string) => void
) => {
  setMessage && setMessage('Load id ')
  const id = (await contractHandler.playGame.getContract().gameId())[0].toNumber()
  setMessage && setMessage('Load user1 id ')
  const gameUser1 = await contractHandler.playGame.getContract().gameUser(0)
  const userId1 = BigNumber.from(gameUser1.userId).toNumber()
  const life1 = BigNumber.from(gameUser1.life).toNumber()
  setMessage && setMessage('Load user2 id ')
  const gameUser2 = await contractHandler.playGame.getContract().gameUser(1)
  const userId2 = BigNumber.from(gameUser2.userId).toNumber()
  const life2 = BigNumber.from(gameUser2.life).toNumber()
  setMessage && setMessage('Load user1 card ')
  const cardList1 = await getGameCardList(contractHandler, 0)
  setMessage && setMessage('Load user2 card ')
  const cardList2 = await getGameCardList(contractHandler, 1)
  setMessage && setMessage('Load latest time ')
  const latestTime = (await contractHandler.playGame.getContract().latestTime())[0].toNumber()
  setMessage && setMessage('Load version ')
  const version = (await contractHandler.playGame.getContract().version())[0]
  setMessage && setMessage('Load turn ')
  const turn = (await contractHandler.playGame.getContract().turn())[0]
  setMessage && setMessage('Load winner ')
  const winner = (await contractHandler.playGame.getContract().winner())[0].toNumber()
  setMessage && setMessage('Load ended ')
  const ended = (await contractHandler.playGame.getContract().ended())[0]
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
  contractHandler: ContractHandlerType,
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
  const tx = await contractHandler.playGame.getContract().endTurn(
    turn,
    _playActionList,
  )

  for (let i = 0; i < tx.result.logs.length; i++) {
    const log = contractHandler.playGame.getContract().interface.parseLog(tx.result.logs[i])
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
  contractHandler: ContractHandlerType,
) => {
  const tx = await contractHandler.playGame.getContract().endGameByTime(

  )
  return tx
}

export const leaveGame = async (
  contractHandler: ContractHandlerType,
) => {

  return await contractHandler.playGame.getContract().leaveGame(

  )
}

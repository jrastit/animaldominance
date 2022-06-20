import * as ethers from 'ethers'
import { network, getTransactionManagerList } from '../__test_util__/testConfig'

import {
  checkAllContract,
} from '../game/contract/contractCheck'
import {
  updateAllContract
} from '../game/contract/contractUpdate'

import {
  newContractHandler
} from '../type/contractType'

import {
  getWithManagerContractPlayGame,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'
import { ContractHandlerType } from '../type/contractType'
import {
  createAllCard,
  loadAllCard,
} from '../game/card'

import {
  getUserId,
  registerUser,
  getUserCardList,
  addUserDefaultDeck,
  getUserDeckList,
} from '../game/user'

import {
  createGame,
  createGameBot,
  getGameId,
  joinGame,
} from '../game/gameList'

import {
  getGameFull,
  endTurn,
  leaveGame,
} from '../game/game'

import {
  getTurnData,
  checkTurnData,
  endTurnData,
} from '../game/turnData'

import {
  playAction,

} from '../game/playGame'

import {
  playRandomly,
} from '../game/gameBot'

import {
  UserDeckType
} from '../type/userType'

import {
  TurnDataType,
  GameActionPayloadType,
} from '../type/gameType'

const check = (val1: number, val2: number, message: string) => {
  if (val1 != val2) {
    console.error(message)
    expect(val1).toBe(val2)
    return false
  }
  return true
}

const autoPlayTurn = async (
  contractHandler: ContractHandlerType,
  userId: number,
  turnData: TurnDataType,
) => {

  const setTurnData = (_turnData: TurnDataType) => {
    turnData = _turnData
  }

  let _playActionList = [] as GameActionPayloadType[]
  do {
    const gameAction = playRandomly(turnData)
    if (gameAction !== 0 && gameAction !== 1) {
      await playAction(contractHandler, gameAction, turnData, setTurnData)
    }
  } while (playRandomly(turnData, true))
  let playTurn = 0
  const addPlayAction = async (payload: GameActionPayloadType) => {
    _playActionList.push(payload)
    if (payload.turn > playTurn) playTurn = payload.turn
  }
  //console.log(turnData.playActionList)
  await endTurn(
    contractHandler,
    turnData.playActionList,
    turnData.turn,
    addPlayAction,
  )

  while (playTurn > turnData.turn) {
    endTurnData(turnData, setTurnData)
    for (let i = 0; i < _playActionList.length; i++) {
      const gameActionPayload = _playActionList[i]
      if (gameActionPayload.turn === turnData.turn) {
        await playAction(
          contractHandler,
          gameActionPayload.gameAction,
          turnData,
          setTurnData
        )
      }
    }
  }
  const game = await getGameFull(contractHandler)
  checkTurnData(game, userId, turnData, check)
  return { turnData, game }
}

const autoPlayGame = async (
  contractHandler1: ContractHandlerType,
  contractHandler2: ContractHandlerType,
  deckId1: number,
  deckId2: number,
  userId1: number,
  userId2: number,
) => {

  const gameId = await createGame(contractHandler1, deckId1)
  //const gameList = await getGameList(gameListContract1)
  //const gameId = gameList[0].id
  await joinGame(contractHandler2, gameId, deckId2)
  const gameChain = await contractHandler1.gameList.getContract().gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game gameListContract not found")
  }
  contractHandler1.playGame.contract = getWithManagerContractPlayGame(contractAddress, contractHandler1.transactionManager)
  contractHandler1.playGame.versionOk = true
  contractHandler2.playGame.contract = getWithManagerContractPlayGame(contractAddress, contractHandler2.transactionManager)
  contractHandler2.playGame.versionOk = true
  let game1 = await getGameFull(contractHandler1)
  let game2 = await getGameFull(contractHandler2)
  let turnData1 = getTurnData(game1, userId1)
  let turnData2 = getTurnData(game2, userId2)
  checkTurnData(game1, userId1, turnData1, check)
  checkTurnData(game2, userId2, turnData2, check)
  expect(turnData1.myTurn != turnData2.myTurn).toBeTruthy()
  do {
    if (turnData1.myTurn) {
      turnData1 = getTurnData(game1, userId1)
      const ret = await autoPlayTurn(
        contractHandler1,
        userId1,
        turnData1,
      )
      turnData1 = ret.turnData
    } else {
      const ret = await autoPlayTurn(
        contractHandler2,
        userId2,
        turnData2,
      )
      turnData2 = ret.turnData
    }
    game1 = await getGameFull(contractHandler1)
    game2 = await getGameFull(contractHandler2)
    turnData1 = getTurnData(game1, userId1)
    turnData2 = getTurnData(game2, userId2)
  } while (!game1.winner || !game2.winner)
}

const autoPlayGameBot = async (
  contractHandler: ContractHandlerType,
  deckId: number,
  userId: number,
) => {

  const gameId = await createGameBot(contractHandler, deckId)
  const gameChain = await contractHandler.gameList.getContract().gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  contractHandler.playGame.contract = getWithManagerContractPlayGame(contractAddress, contractHandler.transactionManager)
  contractHandler.playGame.versionOk = true
  let game = await getGameFull(contractHandler)
  do {
    let turnData = getTurnData(game, userId)
    checkTurnData(game, userId, turnData, check)

    expect(turnData.myTurn).toBe(1)

    const ret = await autoPlayTurn(
      contractHandler,
      userId,
      turnData,
    )
    turnData = ret.turnData

    game = await getGameFull(contractHandler)
    checkTurnData(game, userId, turnData, check)
  } while (!game.ended)
}

const userLeaveGame = async (
  contractHandler: ContractHandlerType,
  userId: number,
) => {
  const gameId = await getGameId(userId, contractHandler)
  if (gameId) {
    const gameChain = await contractHandler.gameList.getContract().gameList(gameId)
    const contractAddress = gameChain.playGame
    if (contractAddress) {
      contractHandler.playGame.contract = getWithManagerContractPlayGame(contractAddress, contractHandler.transactionManager)
      contractHandler.playGame.versionOk = true
      await leaveGame(contractHandler)
    }
  }
}

const testTransaction = () => {

  jest.setTimeout(6000000)

  let transactionManager: TransactionManager[]

  let userId: number
  let userId1: number
  let userId2: number

  let deckList: UserDeckType[]
  let deckList1: UserDeckType[]
  let deckList2: UserDeckType[]

  let contractHandler: ContractHandlerType
  let contractHandler1: ContractHandlerType
  let contractHandler2: ContractHandlerType

  beforeAll(done => {
    const func_async = (async () => {

      try {
        transactionManager = getTransactionManagerList()
        let useCache = false

        contractHandler = newContractHandler(transactionManager[0])
        const isOk = await checkAllContract(network, contractHandler, console.log)

        if (!isOk) {
          await updateAllContract(contractHandler, console.log)
          await createAllCard(contractHandler, console.log)
        } else {
          console.log('use contract cache')
          useCache = true
        }

        await loadAllCard(contractHandler)

        //console.log(transactionManager.transactionList.map(transactionManager.gasInfo))

        contractHandler1 = newContractHandler(transactionManager[1])
        contractHandler2 = newContractHandler(transactionManager[2])
        const isOk1 = await checkAllContract(network, contractHandler1)
        expect(isOk1).toBeTruthy()
        const isOk2 = await checkAllContract(network, contractHandler2)
        expect(isOk2).toBeTruthy()

        if (!useCache) {
          await registerUser(contractHandler, 'test')
          await registerUser(contractHandler1, 'test1')
          await registerUser(contractHandler2, 'test2')
        }

        userId = await getUserId(contractHandler, await transactionManager[0].signer.getAddress())
        if (useCache && !userId) {
          await registerUser(contractHandler, 'test')
          userId = await getUserId(contractHandler, await transactionManager[0].signer.getAddress())
          expect(userId > 0).toBeTruthy()
        }
        userId1 = await getUserId(contractHandler1, await transactionManager[1].signer.getAddress())
        if (useCache && !userId1) {
          await registerUser(contractHandler1, 'test1')
          userId1 = await getUserId(contractHandler1, await transactionManager[1].signer.getAddress())
          expect(userId1 > 0).toBeTruthy()
        }
        userId2 = await getUserId(contractHandler2, await transactionManager[2].signer.getAddress())
        if (useCache && !userId2) {
          await registerUser(contractHandler2, 'test2')
          userId2 = await getUserId(contractHandler2, await transactionManager[2].signer.getAddress())
          expect(userId2 > 0).toBeTruthy()
        }

        const userCardList = await getUserCardList(contractHandler, userId)
        const userCardList1 = await getUserCardList(contractHandler1, userId1)
        const userCardList2 = await getUserCardList(contractHandler2, userId2)
        if (!useCache) {
          await addUserDefaultDeck(contractHandler, userCardList)
          await addUserDefaultDeck(contractHandler1, userCardList1)
          await addUserDefaultDeck(contractHandler2, userCardList2)
        }
        deckList = await getUserDeckList(contractHandler, userId)
        if (useCache && deckList.length === 0) {
          await addUserDefaultDeck(contractHandler, userCardList)
          deckList = await getUserDeckList(contractHandler, userId)
        }
        deckList1 = await getUserDeckList(contractHandler1, userId1)
        if (useCache && deckList1.length === 0) {
          await addUserDefaultDeck(contractHandler1, userCardList1)
          deckList1 = await getUserDeckList(contractHandler1, userId1)
        }
        deckList2 = await getUserDeckList(contractHandler2, userId2)
        if (useCache && deckList2.length === 0) {
          await addUserDefaultDeck(contractHandler2, userCardList2)
          deckList2 = await getUserDeckList(contractHandler2, userId2)
        }
        if (!useCache) {
          console.log(transactionManager[0].transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
          console.log(transactionManager[1].transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
          console.log(transactionManager[2].transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
        }
        if (useCache) {
          await userLeaveGame(contractHandler, userId)
          await userLeaveGame(contractHandler, userId1)
          await userLeaveGame(contractHandler, userId2)
        }
        done()
      } catch (error) {
        done(error)
      }
    })
    func_async()
  })

  describe('Test game', () => {
    it('Test game bot', async () => {
      for (let i = 0; i < 10; i++) {
        await autoPlayGameBot(
          contractHandler,
          deckList[0].id,
          userId,
        )
      }
      let gasUsed = ethers.BigNumber.from(0)
      let gasPrice = ethers.BigNumber.from(0)
      console.log(transactionManager[0].transactionList.map((tx) => {
        if (tx.txu.gasPrice) {
          gasPrice = gasPrice.add(tx.result.gasUsed.mul(tx.txu.gasPrice))
          gasUsed = gasUsed.add(tx.result.gasUsed)
        }
        return (tx.log + ' ' + tx.result.gasUsed.toNumber() + ' ' + (tx.txu.gasPrice && ethers.utils.formatEther(
          tx.result.gasUsed.mul(tx.txu.gasPrice)
        )))
      }))
      console.log(
        "total gaz used :",
        gasUsed.toNumber(),
        ethers.utils.formatEther(gasPrice),
      )
    })

    it('Test game 2', async () => {
      for (let i = 0; i < 10; i++) {
        await autoPlayGame(
          contractHandler1,
          contractHandler2,
          deckList1[0].id,
          deckList2[0].id,
          userId1,
          userId2,
        )
      }
      let gasUsed1 = ethers.BigNumber.from(0)
      let gasUsed2 = ethers.BigNumber.from(0)
      let gasPrice1 = ethers.BigNumber.from(0)
      let gasPrice2 = ethers.BigNumber.from(0)
      console.log(transactionManager[1].transactionList.map((tx) => {
        if (tx.txu.gasPrice) {
          gasPrice1 = gasPrice1.add(tx.result.gasUsed.mul(tx.txu.gasPrice))
          gasUsed1 = gasUsed1.add(tx.result.gasUsed)
        }
        return (tx.log + ' ' + tx.result.gasUsed.toNumber() + ' ' + (tx.txu.gasPrice && ethers.utils.formatEther(
          tx.result.gasUsed.mul(tx.txu.gasPrice)
        )))

      }))
      console.log(transactionManager[2].transactionList.map((tx) => {
        if (tx.txu.gasPrice) {
          gasPrice2 = gasPrice2.add(tx.result.gasUsed.mul(tx.txu.gasPrice))
          gasUsed2 = gasUsed2.add(tx.result.gasUsed)
        }
        return (tx.log + ' ' + tx.result.gasUsed.toNumber() + ' ' + (tx.txu.gasPrice && ethers.utils.formatEther(
          tx.result.gasUsed.mul(tx.txu.gasPrice)
        )))
      }))
      console.log(
        "total gaz used :",
        gasUsed1.toNumber() + gasUsed2.toNumber(),
        ethers.utils.formatEther(gasPrice1.add(gasPrice2)),
        Math.round((gasUsed1.toNumber() / gasUsed2.toNumber()) * 10000) / 100,
        Math.round((gasPrice1.mul(10000).div(gasPrice2)).toNumber()) / 100,
      )
    })
  })
}

testTransaction()

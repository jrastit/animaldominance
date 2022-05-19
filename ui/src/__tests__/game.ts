import * as ethers from 'ethers'
import { network, getWalletList } from '../__test_util__/testConfig'

import {
  createWithManagerContractCardAdmin,
  createWithManagerContractPlayGameFactory,
  getContractPlayGame,
  getContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'
import {
  createAllCard,
  loadAllCard,
  registerTrading,
} from '../game/card'

import {
  getUser,
  getUserId,
  registerUser,
  getUserCardList,
  addUserDefaultDeck,
  getUserDeckList,
} from '../game/user'

import {
  createGame,
  createGameBot,
  joinGame,
} from '../game/gameList'

import {
  getGameFull,
  endTurn,
  leaveGame,
} from '../game/game'

import {
  getTurnData,
  playRandomly,
  checkTurnData,
  playAction,
  endTurnData,
} from '../game/playGame'

import {
  UserDeckType
} from '../type/userType'

import {
  TurnDataType,
  GameActionListType,
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
  gameContract: ethers.Contract,
  transactionManager: TransactionManager,
  userId: number,
  lastPlayActionList: GameActionListType,
  turnData: TurnDataType,
) => {

  const setTurnData = (_turnData: TurnDataType) => {
    turnData = _turnData
  }

  let _playActionList = [] as GameActionPayloadType[]
  do {
    const gameAction = playRandomly(turnData)
    if (gameAction !== 0 && gameAction !== 1) {
      await playAction(gameContract, gameAction, turnData, setTurnData)
    }
  } while (playRandomly(turnData, true))
  if (turnData.playActionList.length === 0 &&
    lastPlayActionList.length === 0 &&
    turnData.turn > 36
  ) {
    await leaveGame(gameContract, transactionManager)
  } else {
    let playTurn = 0
    const addPlayAction = async (payload: GameActionPayloadType) => {
      _playActionList.push(payload)
      if (payload.turn > playTurn) playTurn = payload.turn
    }
    await endTurn(
      gameContract,
      transactionManager,
      turnData.playActionList,
      turnData.turn,
      addPlayAction,
    )

    lastPlayActionList = turnData.playActionList

    while (playTurn > turnData.turn) {
      endTurnData(turnData, setTurnData)
      for (let i = 0; i < _playActionList.length; i++) {
        const gameActionPayload = _playActionList[i]
        if (gameActionPayload.turn === turnData.turn) {
          await playAction(
            gameContract,
            gameActionPayload.gameAction,
            turnData,
            setTurnData
          )
        }
      }
    }
  }
  const game = await getGameFull(gameContract)
  checkTurnData(game, userId, turnData, check)
  return { turnData, lastPlayActionList, game }
}

const autoPlayGame = async (
  contract1: ethers.Contract,
  contract2: ethers.Contract,
  transactionManager1: TransactionManager,
  transactionManager2: TransactionManager,
  deckId1: number,
  deckId2: number,
  userId1: number,
  userId2: number,
) => {

  const gameId = await createGame(contract1, transactionManager1, deckId1)
  //const gameList = await getGameList(contract1)
  //const gameId = gameList[0].id
  await joinGame(contract2, transactionManager2, gameId, deckId2)
  const gameChain = await contract1.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  const gameContract1 = getContractPlayGame(contractAddress, transactionManager1.signer)
  const gameContract2 = getContractPlayGame(contractAddress, transactionManager2.signer)
  let lastPlayActionList = [] as GameActionListType
  let game1 = await getGameFull(gameContract1)
  let game2 = await getGameFull(gameContract2)
  let turnData1 = getTurnData(game1, userId1)
  let turnData2 = getTurnData(game2, userId2)
  checkTurnData(game1, userId1, turnData1, check)
  checkTurnData(game2, userId2, turnData2, check)
  expect(turnData1.myTurn != turnData2.myTurn).toBeTruthy()
  do {
    if (turnData1.myTurn) {
      turnData1 = getTurnData(game1, userId1)
      const ret = await autoPlayTurn(
        gameContract1,
        transactionManager1,
        userId1,
        lastPlayActionList,
        turnData1,
      )
      turnData1 = ret.turnData
      lastPlayActionList = ret.lastPlayActionList
    } else {
      const ret = await autoPlayTurn(
        gameContract2,
        transactionManager2,
        userId2,
        lastPlayActionList,
        turnData2,
      )
      turnData2 = ret.turnData
      lastPlayActionList = ret.lastPlayActionList
    }
    game1 = await getGameFull(gameContract1)
    game2 = await getGameFull(gameContract2)
    turnData1 = getTurnData(game1, userId1)
    turnData2 = getTurnData(game2, userId2)
  } while (!game1.winner || !game2.winner)
}

const autoPlayGameBot = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  deckId: number,
  userId: number,
) => {

  const gameId = await createGameBot(contract, transactionManager, deckId)
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  const gameContract = getContractPlayGame(contractAddress, transactionManager.signer)
  let lastPlayActionList = [] as GameActionListType
  let game = await getGameFull(gameContract)
  do {
    let turnData = getTurnData(game, userId)
    checkTurnData(game, userId, turnData, check)

    expect(turnData.myTurn).toBe(1)

    const ret = await autoPlayTurn(
      gameContract,
      transactionManager,
      userId,
      lastPlayActionList,
      turnData,
    )
    turnData = ret.turnData
    lastPlayActionList = ret.lastPlayActionList

    game = await getGameFull(gameContract)
    checkTurnData(game, userId, turnData, check)
  } while (!game.ended)
}

const userLeaveGame = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  userId: number,
) => {
  const user = await getUser(contract, userId)
  if (user.gameId) {
    const gameChain = await contract.gameList(user.gameId)
    const contractAddress = gameChain.playGame
    if (contractAddress) {
      const gameContract = getContractPlayGame(contractAddress, transactionManager.signer)
      await leaveGame(gameContract, transactionManager)
    }
  }
}

const testTransaction = () => {

  let walletList: ethers.Signer[]

  jest.setTimeout(6000000)

  let contract: ethers.Contract
  let contract1: ethers.Contract
  let contract2: ethers.Contract

  let transactionManager: TransactionManager
  let transactionManager1: TransactionManager
  let transactionManager2: TransactionManager

  let userId: number
  let userId1: number
  let userId2: number

  let deckList: UserDeckType[]
  let deckList1: UserDeckType[]
  let deckList2: UserDeckType[]

  beforeAll(done => {
    const func_async = (async () => {

      try {
        walletList = getWalletList()
        transactionManager = new TransactionManager(walletList[0])
        transactionManager1 = new TransactionManager(walletList[1])
        transactionManager2 = new TransactionManager(walletList[2])
        let useCache = false
        if (network.gameContract) {
          contract = getContractCardAdmin(ethers.utils.getAddress(network.gameContract), transactionManager.signer)
          try {
            const owner = await contract.owner()
            if (owner === await transactionManager.getAddress()) {
              useCache = true
            }
          } catch {

          }
        }
        if (!useCache) {
          const factory = await createWithManagerContractPlayGameFactory(
            transactionManager
          )
          contract = await createWithManagerContractCardAdmin(
            factory,
            transactionManager,
          )
          await registerTrading(contract, transactionManager)

          await createAllCard(contract, transactionManager)

        }

        //console.log(transactionManager.transactionList.map(transactionManager.gasInfo))
        await loadAllCard(contract)

        contract1 = getContractCardAdmin(
          contract.address,
          transactionManager1.signer,
        )

        contract2 = getContractCardAdmin(
          contract.address,
          transactionManager2.signer,
        )

        if (!useCache) {
          await registerUser(contract, transactionManager, 'test')
          await registerUser(contract1, transactionManager1, 'test1')
          await registerUser(contract2, transactionManager2, 'test2')
        }

        userId = await getUserId(contract, await transactionManager.signer.getAddress())
        userId1 = await getUserId(contract1, await transactionManager1.signer.getAddress())
        userId2 = await getUserId(contract2, await transactionManager2.signer.getAddress())
        const userCardList = await getUserCardList(contract, userId)
        const userCardList1 = await getUserCardList(contract1, userId1)
        const userCardList2 = await getUserCardList(contract2, userId2)
        if (!useCache) {
          await addUserDefaultDeck(contract, transactionManager, userCardList)
          await addUserDefaultDeck(contract1, transactionManager1, userCardList1)
          await addUserDefaultDeck(contract2, transactionManager2, userCardList2)
        }
        deckList = await getUserDeckList(contract, userId)
        deckList1 = await getUserDeckList(contract1, userId1)
        deckList2 = await getUserDeckList(contract2, userId2)
        if (!useCache) {
          console.log(transactionManager.transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
          console.log(transactionManager1.transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
          console.log(transactionManager2.transactionList.map((tx) => {
            return (tx.log + ' ' + tx.result.gasUsed.toNumber())
          }))
        }
        if (useCache) {
          await userLeaveGame(contract, transactionManager, userId)
          await userLeaveGame(contract, transactionManager1, userId1)
          await userLeaveGame(contract, transactionManager2, userId2)
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
          contract,
          transactionManager,
          deckList[0].id,
          userId,
        )
      }
      let gasUsed = ethers.BigNumber.from(0)
      let gasPrice = ethers.BigNumber.from(0)
      console.log(transactionManager.transactionList.map((tx) => {
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
          contract1,
          contract2,
          transactionManager1,
          transactionManager2,
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
      console.log(transactionManager1.transactionList.map((tx) => {
        if (tx.txu.gasPrice) {
          gasPrice1 = gasPrice1.add(tx.result.gasUsed.mul(tx.txu.gasPrice))
          gasUsed1 = gasUsed1.add(tx.result.gasUsed)
        }
        return (tx.log + ' ' + tx.result.gasUsed.toNumber() + ' ' + (tx.txu.gasPrice && ethers.utils.formatEther(
          tx.result.gasUsed.mul(tx.txu.gasPrice)
        )))

      }))
      console.log(transactionManager2.transactionList.map((tx) => {
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

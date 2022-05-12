import * as ethers from 'ethers'
import { getWalletList } from '../__test_util__/testConfig'

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
  getUserId,
  registerUser,
  addUserStarterCard,
  getUserCardList,
  addUserDefaultDeck,
  getUserDeckList,
} from '../game/user'

import {
  createGame,
  createGameBot,
  joinGame,
  getGameFull,
  endTurn,
  leaveGame,
} from '../game/game'

import {
  isMyTurn,
  getTurnData,
  playRandomly,
  checkTurnData,
  playAction,
} from '../game/playGame'

import {
  UserDeckType
} from '../type/userType'

import {
  TurnDataType,
} from '../type/gameType'

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
  const check = (val1: number, val2: number, message: string) => {
    if (val1 != val2) {
      console.error(message)
      expect(val1).toBe(val2)
      return false
    }
    return true
  }

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
  let lastPlayActionList = [] as number[][]
  let game1 = await getGameFull(gameContract1)
  let game2 = await getGameFull(gameContract2)
  do {
    let turnData1 = getTurnData(game1, userId1)
    let turnData2 = getTurnData(game2, userId2)
    const setTurnData1 = (turnData: TurnDataType) => {
      turnData1 = turnData
    }
    const setTurnData2 = (turnData: TurnDataType) => {
      turnData2 = turnData
    }
    const myTurn1 = isMyTurn(game1.turn, game1.userId1, userId1)
    const myTurn2 = isMyTurn(game2.turn, game2.userId1, userId2)
    expect(myTurn1 != myTurn2).toBeTruthy()
    if (myTurn1) {
      let data
      do {
        data = playRandomly(myTurn1, turnData1)
        if (Array.isArray(data)) {
          playAction(myTurn1, data, turnData1, setTurnData1)
        }
      } while (Array.isArray(data))
      //console.log(userId1, game1.turn, turnData1.playActionList.length)
      if (turnData1.playActionList.length === 0 &&
        lastPlayActionList.length === 0 &&
        game1.turn > 36
      ) {
        await leaveGame(gameContract1, transactionManager1)
      } else {
        await endTurn(
          gameContract1,
          transactionManager1,
          turnData1.playActionList,
          game1.turn,
          game1.cardList2,
        )
        lastPlayActionList = turnData1.playActionList
      }
    } else {
      let data
      do {
        data = playRandomly(myTurn2, turnData2)
        if (Array.isArray(data)) {
          playAction(myTurn2, data, turnData2, setTurnData2)
        }
      } while (Array.isArray(data))
      //console.log(userId2, game2.turn, turnData2.playActionList.length)
      if (turnData2.playActionList.length === 0 &&
        lastPlayActionList.length === 0 &&
        game1.turn > 36
      ) {
        await leaveGame(gameContract2, transactionManager2)
      } else {
        await endTurn(
          gameContract2,
          transactionManager2,
          turnData2.playActionList,
          game2.turn,
          game2.cardList2,
        )
        lastPlayActionList = turnData2.playActionList
      }
    }
    game1 = await getGameFull(gameContract1)
    game2 = await getGameFull(gameContract2)
    if (myTurn1) {
      checkTurnData(game1, userId1, turnData1, check)
    } else {
      checkTurnData(game2, userId2, turnData2, check)
    }
  } while (!game1.winner || !game2.winner)
}

const autoPlayGameBot = async (
  contract: ethers.Contract,
  transactionManager: TransactionManager,
  deckId: number,
  userId: number,
) => {
  const check = (val1: number, val2: number, message: string) => {
    if (val1 != val2) {
      console.error(message)
      expect(val1).toBe(val2)
      return false
    }
    return true
  }

  const gameId = await createGameBot(contract, transactionManager, deckId)
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  const gameContract = getContractPlayGame(contractAddress, transactionManager.signer)
  let lastPlayActionList = [] as number[][]
  let game = await getGameFull(gameContract)
  do {
    let turnData = getTurnData(game, userId)
    const setTurnData = (_turnData: TurnDataType) => {
      turnData = _turnData
    }
    const myTurn = isMyTurn(game.turn, game.userId1, userId)
    expect(myTurn).toBe(1)

    let data
    let nextPlayAction = [] as number[][]
    let cardList1
    do {
      data = playRandomly(myTurn, turnData)
      if (Array.isArray(data)) {
        playAction(myTurn, data, turnData, setTurnData)
      }
    } while (Array.isArray(data))
    //console.log(userId1, game1.turn, turnData1.playActionList.length)
    if (turnData.playActionList.length === 0 &&
      lastPlayActionList.length === 0 &&
      game.turn > 36
    ) {
      await leaveGame(gameContract, transactionManager)
    } else {
      const _addPlayAction = (payload: {
        turn: number,
        actionId: number,
        data: number[]
      }) => {
        //console.log(payload)
        nextPlayAction.push(payload.data)
      }

      cardList1 = await endTurn(
        gameContract,
        transactionManager,
        turnData.playActionList,
        game.turn,
        turnData.cardList[1],
        _addPlayAction,
      )

      lastPlayActionList = turnData.playActionList

      turnData.turn = turnData.turn++
      turnData.mana = (turnData.turn + 1) % 2
      turnData.cardList[1] = cardList1
      //turnData.life = turnData.life
      for (let i = 0; i < nextPlayAction.length; i++) {
        playAction(1 - myTurn, nextPlayAction[i], turnData, setTurnData)
      }
    }
    game = await getGameFull(gameContract)
    checkTurnData(game, userId, turnData, check)
  } while (!game.ended)
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
        const factory = await createWithManagerContractPlayGameFactory(
          transactionManager
        )
        contract = await createWithManagerContractCardAdmin(
          factory,
          transactionManager,
        )
        await registerTrading(contract, transactionManager)

        await createAllCard(contract, transactionManager)
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

        await registerUser(contract, transactionManager, 'test')
        await registerUser(contract1, transactionManager1, 'test1')
        await registerUser(contract2, transactionManager2, 'test2')

        userId = await getUserId(contract, await transactionManager.signer.getAddress())
        userId1 = await getUserId(contract1, await transactionManager1.signer.getAddress())
        userId2 = await getUserId(contract2, await transactionManager2.signer.getAddress())
        await addUserStarterCard(contract, transactionManager, userId)
        await addUserStarterCard(contract1, transactionManager1, userId1)
        await addUserStarterCard(contract2, transactionManager2, userId2)
        const userCardList = await getUserCardList(contract, userId)
        const userCardList1 = await getUserCardList(contract1, userId1)
        const userCardList2 = await getUserCardList(contract2, userId2)
        await addUserDefaultDeck(contract, transactionManager, userCardList)
        await addUserDefaultDeck(contract1, transactionManager1, userCardList1)
        await addUserDefaultDeck(contract2, transactionManager2, userCardList2)
        deckList = await getUserDeckList(contract, userId)
        deckList1 = await getUserDeckList(contract1, userId1)
        deckList2 = await getUserDeckList(contract2, userId2)
        console.log(transactionManager.transactionList.map((tx) => {
          return (tx.log + ' ' + tx.result.gasUsed.toNumber())
        }))
        console.log(transactionManager1.transactionList.map((tx) => {
          return (tx.log + ' ' + tx.result.gasUsed.toNumber())
        }))
        console.log(transactionManager2.transactionList.map((tx) => {
          return (tx.log + ' ' + tx.result.gasUsed.toNumber())
        }))
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

    it('Test game', async () => {
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

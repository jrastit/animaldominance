import * as ethers from 'ethers'
import { network, getTransactionManagerList } from '../__test_util__/testConfig'

import {
  checkAllContract,
  updateAllContract
} from '../game/contract'

import {
  newContractHandler
} from '../type/contractType'

import {
  getWithManagerContractPlayGame,
  ContractPlayGame,
  ContractGameManager,
} from '../contract/solidity/compiled/contractAutoFactory'

import { TransactionManager } from '../util/TransactionManager'
import {
  createAllCard,
  loadAllCard,
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
  gameContract: ContractPlayGame,
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
      await playAction(gameContract, gameAction, turnData, setTurnData)
    }
  } while (playRandomly(turnData, true))
  let playTurn = 0
  const addPlayAction = async (payload: GameActionPayloadType) => {
    _playActionList.push(payload)
    if (payload.turn > playTurn) playTurn = payload.turn
  }
  //console.log(turnData.playActionList)
  await endTurn(
    gameContract,
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
          gameContract,
          gameActionPayload.gameAction,
          turnData,
          setTurnData
        )
      }
    }
  }
  const game = await getGameFull(gameContract)
  checkTurnData(game, userId, turnData, check)
  return { turnData, game }
}

const autoPlayGame = async (
  contract1: ContractGameManager,
  contract2: ContractGameManager,
  deckId1: number,
  deckId2: number,
  userId1: number,
  userId2: number,
) => {

  const gameId = await createGame(contract1, deckId1)
  //const gameList = await getGameList(contract1)
  //const gameId = gameList[0].id
  await joinGame(contract2, gameId, deckId2)
  const gameChain = await contract1.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  const gameContract1 = getWithManagerContractPlayGame(contractAddress, contract1.transactionManager)
  const gameContract2 = getWithManagerContractPlayGame(contractAddress, contract2.transactionManager)
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
        userId1,
        turnData1,
      )
      turnData1 = ret.turnData
    } else {
      const ret = await autoPlayTurn(
        gameContract2,
        userId2,
        turnData2,
      )
      turnData2 = ret.turnData
    }
    game1 = await getGameFull(gameContract1)
    game2 = await getGameFull(gameContract2)
    turnData1 = getTurnData(game1, userId1)
    turnData2 = getTurnData(game2, userId2)
  } while (!game1.winner || !game2.winner)
}

const autoPlayGameBot = async (
  contract: ContractGameManager,
  deckId: number,
  userId: number,
) => {

  const gameId = await createGameBot(contract, deckId)
  const gameChain = await contract.gameList(gameId)
  const contractAddress = gameChain.playGame
  if (!contractAddress) {
    throw Error("Game contract not found")
  }
  const gameContract = getWithManagerContractPlayGame(contractAddress, contract.transactionManager)
  let game = await getGameFull(gameContract)
  do {
    let turnData = getTurnData(game, userId)
    checkTurnData(game, userId, turnData, check)

    expect(turnData.myTurn).toBe(1)

    const ret = await autoPlayTurn(
      gameContract,
      userId,
      turnData,
    )
    turnData = ret.turnData

    game = await getGameFull(gameContract)
    checkTurnData(game, userId, turnData, check)
  } while (!game.ended)
}

const userLeaveGame = async (
  contract: ContractGameManager,
  userId: number,
) => {
  const user = await getUser(contract, userId)
  if (user.gameId) {
    const gameChain = await contract.gameList(user.gameId)
    const contractAddress = gameChain.playGame
    if (contractAddress) {
      const gameContract = getWithManagerContractPlayGame(contractAddress, contract.transactionManager)
      await leaveGame(gameContract)
    }
  }
}

const testTransaction = () => {

  jest.setTimeout(6000000)

  let contract: ContractGameManager
  let contract1: ContractGameManager
  let contract2: ContractGameManager

  let transactionManager: TransactionManager[]

  let userId: number
  let userId1: number
  let userId2: number

  let deckList: UserDeckType[]
  let deckList1: UserDeckType[]
  let deckList2: UserDeckType[]

  beforeAll(done => {
    const func_async = (async () => {

      try {
        transactionManager = getTransactionManagerList()
        let useCache = false

        const contractHandler = newContractHandler(transactionManager[0])
        const isOk = await checkAllContract(network, contractHandler)

        if (!isOk) {
          await updateAllContract(contractHandler)
          if (contractHandler.gameManager.contract) {
            contract = contractHandler.gameManager.contract
          }
          await createAllCard(contract)
        } else {
          console.log('use contract cache')
          useCache = true
        }

        if (contractHandler.gameManager.contract) {
          contract = contractHandler.gameManager.contract
        }

        await loadAllCard(contract)

        //console.log(transactionManager.transactionList.map(transactionManager.gasInfo))

        const contractHandler1 = newContractHandler(transactionManager[1])
        const contractHandler2 = newContractHandler(transactionManager[2])
        const isOk1 = await checkAllContract(network, contractHandler1)
        expect(isOk1).toBeTruthy()
        const isOk2 = await checkAllContract(network, contractHandler2)
        expect(isOk2).toBeTruthy()

        if (contractHandler1.gameManager.contract) {
          contract1 = contractHandler1.gameManager.contract
        }

        if (contractHandler2.gameManager.contract) {
          contract2 = contractHandler2.gameManager.contract
        }

        console.log(
          await contract.signer.getAddress(),
          contract.address,
          await contract1.signer.getAddress(),
          contract1.address,
          await contract2.signer.getAddress(),
          contract2.address,
        )

        if (!useCache) {
          await registerUser(contract, 'test')
          await registerUser(contract1, 'test1')
          await registerUser(contract2, 'test2')
        }

        userId = await getUserId(contract, await transactionManager[0].signer.getAddress())
        userId1 = await getUserId(contract1, await transactionManager[1].signer.getAddress())
        userId2 = await getUserId(contract2, await transactionManager[2].signer.getAddress())
        const userCardList = await getUserCardList(contract, userId)
        const userCardList1 = await getUserCardList(contract1, userId1)
        const userCardList2 = await getUserCardList(contract2, userId2)
        if (!useCache) {
          await addUserDefaultDeck(contract, userCardList)
          await addUserDefaultDeck(contract1, userCardList1)
          await addUserDefaultDeck(contract2, userCardList2)
        }
        deckList = await getUserDeckList(contract, userId)
        deckList1 = await getUserDeckList(contract1, userId1)
        deckList2 = await getUserDeckList(contract2, userId2)
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
          await userLeaveGame(contract, userId)
          await userLeaveGame(contract, userId1)
          await userLeaveGame(contract, userId2)
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
          contract1,
          contract2,
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

import { utils as ethersUtils } from 'ethers'

import {
  updateStep,
  setMessage,
  setError,
  StepId,
  Step,
  resetAllSubStep,
} from '../../reducer/contractSlice'

import {
  getUserId,
  getUser,
  getUserCardList,
  getUserDeckList,
} from '../../game/user'

import {
  getCardLastId,
  loadAllCard,
} from '../../game/card'

import {
  updateAnimalDominanceContractHash as _updateAnimalDominanceContractHash,
  checkAllContract,
  updateAllContract,
} from '../../game/contract'

import {
  loadAllTrade,
} from '../../game/trading'

import {
  getGameList,
} from '../../game/gameList'

import {
  createAllCard,
} from '../../game/card'

import {
  setCardList,
  setTradeList,
  addTrade,
  removeTrade,
  clearCardList,
} from '../../reducer/cardListSlice'

import {
  addGameList,
  fillGameList,
  endGameList,
  setGameList,
  clearGameList,
  clearGame,
} from '../../reducer/gameSlice'

import {
  clearUser,
  clearUserDeckList,
  clearUserCardList,
  setUser,
  setUserCardList,
  setUserDeckList,
} from '../../reducer/userSlice'

import {
  ContractGameManager,
  ContractTrading,
} from '../../contract/solidity/compiled/contractAutoFactory'

import {
  ContractHandlerType
} from '../../type/contractType'

import {
  UserType
} from '../../type/userType'

import {
  NetworkType
} from '../../type/networkType'

const stepId = StepId.Contract

export const clearState = (
  dispatch: any,
) => {
  dispatch(clearCardList())
  dispatch(clearUser())
  dispatch(clearUserDeckList())
  dispatch(clearUserCardList())
  dispatch(clearGame())
  dispatch(clearGameList())
}

export const fillContract = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }
  _setMessage("Adding all cards...")
  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  createAllCard(contract, _setMessage).then(() => {
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const updateContract = async (
  dispatch: any,
  network: NetworkType | undefined,
  contractHandler: ContractHandlerType,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }

  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  checkAllContract(network, contractHandler, _setMessage).then(isOk => {
    if (!isOk) {
      updateAllContract(contractHandler, _setMessage).then(() => {
        clearState(dispatch)
        dispatch(resetAllSubStep())
        if (contractHandler.gameManager.contract) {
          fillContract(dispatch, contractHandler.gameManager.contract)
        } else {
          dispatch(setError({ id: stepId, error: 'Error Game Manager not set' }))
        }
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    } else {
      if (contractHandler.gameManager.contract) {
        fillContract(dispatch, contractHandler.gameManager.contract)
      } else {
        dispatch(setError({ id: stepId, error: "Invalid game manager" }))
      }

    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const updateAnimalDominanceContractHash = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  _updateAnimalDominanceContractHash(contractHandler, _setMessage).then(async (_contract) => {
    clearState(dispatch)
    dispatch(resetAllSubStep())
    dispatch(updateStep({ id: stepId, step: Step.Init }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}


export const _loadAllTread = (
  dispatch: any,
  contract: ContractGameManager,
  tradingContract: ContractTrading,
) => {
  const stepId = StepId.Trading
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  const setMessageTradeList = (message: string | undefined) => {
    dispatch(setMessage({ id: StepId.Trading, message: message }))
  }
  try {
    addTradingListener(dispatch, tradingContract)
  } catch (err: any) {
    dispatch(setError({ id: stepId, catchError: err }))
    return
  }
  loadAllTrade(contract, tradingContract, setMessageTradeList).then((_tradeList) => {
    dispatch(setTradeList(_tradeList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const addTradingListener = (
  dispatch: any,
  tradingContract: ContractTrading,
) => {
  if (tradingContract.listenerCount("TradeAdd") === 0) {
    tradingContract.on("TradeAdd", (_cardId, _level, _chainUserId, _userCardId, _price) => {
      const _userId = _chainUserId.toNumber()
      console.log("Trade add event ", _cardId, _level, _userId, _userCardId, ethersUtils.formatEther(_price))
      dispatch(addTrade({
        cardId: _cardId,
        level: _level,
        userId: _userId,
        userCardId: _userCardId,
        price: _price,
      }))
    })
  }
  if (tradingContract.listenerCount("TradeRemove") === 0) {
    tradingContract.on("TradeRemove", (_cardId, _level, _chainUserId, _userCardId) => {
      const _userId = _chainUserId.toNumber()
      console.log("Trade remove event ", _cardId, _level, _userId, _userCardId)
      dispatch(removeTrade({
        cardId: _cardId,
        level: _level,
        userId: _userId,
        userCardId: _userCardId,
      }))
    })
  }
}

export const loadUser = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  const stepId = StepId.User
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserId(contract).then((userId) => {
    if (userId && contract) {
      getUser(contract, userId).then((_user) => {
        dispatch(setUser(_user))
        dispatch(updateStep({ id: stepId, step: Step.Ok }))
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    } else if (contract) {
      dispatch(updateStep({ id: stepId, step: Step.NotSet }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadUserCardList = (
  dispatch: any,
  contract: ContractGameManager,
  user: UserType,
) => {
  const stepId = StepId.UserCardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserCardList(contract, user.id).then((_userCardList) => {
    if (_userCardList.length > 0) {
      dispatch(setUserCardList(_userCardList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadUserDeckList = (
  dispatch: any,
  contract: ContractGameManager,
  user: UserType,
) => {
  const stepId = StepId.UserDeckList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserDeckList(contract, user.id).then((_userDeckList) => {
    if (_userDeckList.length > 0) {
      dispatch(setUserDeckList(_userDeckList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadCardList = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  const stepId = StepId.CardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  const setMessageCardList = (message: string | undefined) => {
    dispatch(setMessage({ id: StepId.CardList, message: message }))
  }
  loadAllCard(contract, setMessageCardList).then((_cardList) => {
    if (_cardList.length > 0) {
      dispatch(setCardList(_cardList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Empty }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadGameList = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  const stepId = StepId.GameList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  try {
    addGameListener(dispatch, contract)
  } catch (err: any) {
    dispatch(setError({ id: stepId, catchError: err }))
    return
  }
  getGameList(contract).then((_gameList) => {
    dispatch(setGameList(_gameList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const addGameListener = (
  dispatch: any,
  contract: ContractGameManager,
) => {
  if (contract.listenerCount("GameCreated") === 0) {
    contract.on("GameCreated", (_chainGameId, _chainUserId) => {
      const _gameId = _chainGameId.toNumber()
      const _userId = _chainUserId.toNumber()
      console.log("game created event ", _gameId, _userId)
      dispatch(addGameList({
        id: _gameId,
        userId1: _userId,
        userId2: 0,
        userDeck1: 0,
        userDeck2: 0,
        winner: 0,
        ended: false,
        playGame: undefined,
      }))
    })
  }
  if (contract.listenerCount("GameFill") === 0) {
    contract.on("GameFill", (_chainGameId, _chainUserId) => {
      const _gameId = _chainGameId.toNumber()
      const _userId = _chainUserId.toNumber()
      console.log("game join event", _gameId, _userId)
      dispatch(fillGameList({
        id: _gameId,
        userId: _userId,
      }))
    })
  }
  if (contract.listenerCount("GameEnd") === 0) {
    contract.on("GameEnd", (_chainGameId, _chainWinner) => {
      const _gameId = _chainGameId.toNumber()
      const _winner = _chainWinner.toNumber()
      console.log("game end event", _gameId, _winner)
      dispatch(endGameList({
        id: _gameId,
        winner: _winner,
      }))
    })
  }
}

export const loadContract = async (
  dispatch: any,
  contractHandler: ContractHandlerType,
  network: NetworkType
) => {
  const stepId = StepId.Contract
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  dispatch(setMessage({ id: stepId, message: 'Loading contract...' }))
  if (network.gameContract) {
    checkAllContract(
      network,
      contractHandler
    ).then(async (isOk) => {
      if (isOk && contractHandler.gameManager.contract) {
        if (await getCardLastId(contractHandler.gameManager.contract) > 0) {
          dispatch(updateStep({ id: stepId, step: Step.Ok }))
        } else {
          dispatch(updateStep({ id: stepId, step: Step.Empty }))
        }
      } else {
        if (!contractHandler.animalDominance.contract) {
          dispatch(setError({ id: stepId, error: "Animal Dominance not set" }))
        } else if (!contractHandler.animalDominance.versionOk) {
          dispatch(setError({ id: stepId, error: "Animal Dominance version not found at address" }))
        } else {
          dispatch(setError({ id: stepId, error: "Wrong version of contract, update game" }))
        }
      }
    })
  } else {
    //no game contract set
    dispatch(updateStep({ id: stepId, step: Step.NoAddress }))
  }
}

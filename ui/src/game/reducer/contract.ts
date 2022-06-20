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
  checkAllContract,
} from '../../game/contract/contractCheck'

import {
  updateAnimalDominanceContractHash as _updateAnimalDominanceContractHash,
  updateAllContract,
} from '../../game/contract/contractUpdate'

import {
  loadAllTrade,
} from '../../game/trading'

import {
  getGameList,
  getGameId,
} from '../../game/gameList'

import {
  createAllCard,
} from '../../game/card'

import {
  nftLoadHistorySelf,
} from '../../game/nft'

import {
  setCardList,
  setTradeList,
  setNFTList,
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
  setGameId,
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

export const fillContract = async (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const _setMessage = (message: string | undefined) => {
    dispatch(setMessage({ id: stepId, message: message }))
  }
  _setMessage("Adding all cards...")
  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  await createAllCard(contractHandler, _setMessage).then(() => {
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
    console.log("Update crontract", message)
    dispatch(setMessage({ id: stepId, message: message }))
  }
  dispatch(updateStep({ id: stepId, step: Step.Creating }))
  checkAllContract(network, contractHandler, _setMessage).then(async (isOk) => {
    if (!isOk) {
      updateAllContract(contractHandler, _setMessage).then(async () => {
        clearState(dispatch)
        dispatch(resetAllSubStep())
        await fillContract(dispatch, contractHandler)
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    } else {
      await fillContract(dispatch, contractHandler)
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
  _updateAnimalDominanceContractHash(contractHandler, _setMessage).then(async () => {
    clearState(dispatch)
    dispatch(resetAllSubStep())
    dispatch(updateStep({ id: stepId, step: Step.Init }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}


export const _loadAllTread = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.Trading
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  const setMessageTradeList = (message: string | undefined) => {
    dispatch(setMessage({ id: StepId.Trading, message: message }))
  }
  try {
    addTradingListener(dispatch, contractHandler)
  } catch (err: any) {
    dispatch(setError({ id: stepId, catchError: err }))
    return
  }
  loadAllTrade(
    contractHandler,
    setMessageTradeList).then((_tradeList) => {
      dispatch(setTradeList(_tradeList))
      dispatch(updateStep({ id: stepId, step: Step.Ok }))
    }).catch((err) => {
      dispatch(setError({ id: stepId, catchError: err }))
    })
}

const addTradingListener = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  if (contractHandler.trading.getContract().listenerCount("TradeAdd") === 0) {
    contractHandler.trading.getContract().on("TradeAdd", (_cardId, _level, _chainUserId, _userCardId, _price) => {
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
  if (contractHandler.trading.getContract().listenerCount("TradeRemove") === 0) {
    contractHandler.trading.getContract().on("TradeRemove", (_cardId, _level, _chainUserId, _userCardId) => {
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

export const loadNFT = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.Nft
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  nftLoadHistorySelf(contractHandler).then(nftList => {
    dispatch(setNFTList(nftList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadUser = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.User
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserId(contractHandler).then((userId) => {
    if (userId && contractHandler.gameManager.getContract()) {
      getUser(contractHandler, userId).then((_user) => {
        dispatch(setUser(_user))
        dispatch(updateStep({ id: stepId, step: Step.Ok }))
      }).catch((err) => {
        dispatch(setError({ id: stepId, catchError: err }))
      })
    } else if (contractHandler.gameManager.getContract()) {
      dispatch(updateStep({ id: stepId, step: Step.NotSet }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadUserCardList = (
  dispatch: any,
  contractHandler: ContractHandlerType,
  user: UserType,
) => {
  const stepId = StepId.UserCardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserCardList(contractHandler, user.id).then((_userCardList) => {
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
  contractHandler: ContractHandlerType,
  user: UserType,
) => {
  const stepId = StepId.UserDeckList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getUserDeckList(contractHandler, user.id).then((_userDeckList) => {
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
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.CardList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  const setMessageCardList = (message: string | undefined) => {
    dispatch(setMessage({ id: StepId.CardList, message: message }))
  }
  loadAllCard(contractHandler, setMessageCardList).then((_cardList) => {
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
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.GameList
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  try {
    addGameListener(dispatch, contractHandler)
  } catch (err: any) {
    dispatch(setError({ id: stepId, catchError: err }))
    return
  }
  getGameList(contractHandler).then((_gameList) => {
    dispatch(setGameList(_gameList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const loadGameId = (
  userId: number,
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.Game
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  getGameId(userId, contractHandler).then((_id) => {
    dispatch(setGameId(_id))
    if (!_id) {
      dispatch(updateStep({ id: stepId, step: Step.NotSet }))
    } else {
      dispatch(updateStep({ id: stepId, step: Step.Ready }))
    }
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

const addGameListener = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  if (contractHandler.gameList.getContract().listenerCount("GameCreated") === 0) {
    contractHandler.gameList.getContract().on("GameCreated", (_chainGameId, _chainUserId) => {
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
  if (contractHandler.gameList.getContract().listenerCount("GameFill") === 0) {
    contractHandler.gameList.getContract().on("GameFill", (_chainGameId, _chainUserId) => {
      const _gameId = _chainGameId.toNumber()
      const _userId = _chainUserId.toNumber()
      console.log("game join event", _gameId, _userId)
      dispatch(fillGameList({
        id: _gameId,
        userId: _userId,
      }))
    })
  }
  if (contractHandler.gameList.getContract().listenerCount("GameEnd") === 0) {
    contractHandler.gameList.getContract().on("GameEnd", (_chainGameId, _chainWinner) => {
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
  const _setMessage = (message: string | undefined) => {
    console.log("Load contract", message)
    dispatch(setMessage({ id: stepId, message: message }))
  }
  _setMessage('Loading contract...')
  //dispatch(setMessage({ id: stepId, message: 'Loading contract...' }))
  if (network.gameContract) {
    checkAllContract(
      network,
      contractHandler,
      _setMessage,
    ).then(async (isOk) => {
      if (isOk) {
        if (await getCardLastId(contractHandler) > 0) {
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
          dispatch(setError({ id: stepId, error: "Wrong version of Animal Dominance" }))
        }
      }
    }).catch((err) => {
      dispatch(setError({ id: stepId, catchError: err }))
    })
  } else {
    //no game contractHandler.gameManager.getContract() set
    dispatch(updateStep({ id: stepId, step: Step.NoAddress }))
  }
}

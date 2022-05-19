import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type {
  GameListItemType,
    GameType,
    GameActionListType,
    GameActionPayloadType,
} from '../type/gameType'
import type { UserType } from '../type/userType'

// Define a type for the slice state
interface GameState {
  game: GameType | undefined
  gameList: GameListItemType[]
  gameVersion: number
  oponent: UserType | undefined
  playActionList: GameActionListType[],
}

// Define the initial state using that type
const initialState: GameState = {
  game: undefined,
  gameList: [],
  gameVersion: 0,
  oponent: undefined,
  playActionList: [],
}

export const _fillGame = (
  state: GameState,
  gameJoin: { id: number, userId: number }
) => {
  state.gameList = state.gameList.map(_game => {
    if (_game.id === gameJoin.id) {
      _game.userId2 = gameJoin.userId
    }
    return _game
  })
}

export const _endGame = (
  state: GameState,
  gameEnd: { id: number, winner: number }
) => {
  state.gameList = state.gameList.map(_game => {
    if (_game.id === gameEnd.id) {
      _game.winner = gameEnd.winner
      _game.ended = true
    }
    return _game
  })
}

export const _addGame = (
  state: GameState,
  game: GameListItemType
) => {
  let found = false
  state.gameList = state.gameList.map(_game => {
    if (_game.id === game.id) {
      found = true
      if (game.userId2) return game
    }
    return _game
  })
  if (!found) {
    state.gameList.push(game)
    state.gameList = state.gameList.map(game => game)
  }
}

export const gameSlice = createSlice({
  name: 'game',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addGameList: (state, action: PayloadAction<GameListItemType>) => {
      _addGame(state, action.payload)
    },
    fillGameList: (state, action: PayloadAction<{ id: number, userId: number }>) => {
      _fillGame(state, action.payload)
    },
    endGameList: (state, action: PayloadAction<{ id: number, winner: number }>) => {
      _endGame(state, action.payload)
    },
    setGameList: (state, action: PayloadAction<GameListItemType[]>) => {
      action.payload.forEach(game => _addGame(state, game))
    },
    clearGameList: (state) => {
      state.gameList = []
    },
    setGameVersion: (state, action: PayloadAction<number>) => {
      state.gameVersion = action.payload
    },
    setOponent: (state, action: PayloadAction<UserType>) => {
      state.oponent = action.payload
    },
    setGame: (state, action: PayloadAction<GameType>) => {
      state.game = action.payload
    },
    addPlayAction: (state, action: PayloadAction<GameActionPayloadType>) => {
      for (let i = state.playActionList.length; i < action.payload.turn; i++) {
        state.playActionList[i] = []
      }
      for (let i = state.playActionList[action.payload.turn - 1].length; i < action.payload.id; i++) {
        state.playActionList[action.payload.turn - 1][i] = null
      }
      state.playActionList[action.payload.turn - 1][action.payload.id] = action.payload.gameAction
    },
    cleanGame: (state) => {
      state.game = undefined
      state.gameVersion = 0
      state.oponent = undefined
      state.playActionList = []
    },
    clearGame: (state) => {
      state.game = undefined
      state.gameVersion = 0
      state.oponent = undefined
      state.playActionList = []
    }
  },
})

export const {
  addGameList,
  fillGameList,
  endGameList,
  setGameList,
  clearGameList,
  setGame,
  setOponent,
  setGameVersion,
  clearGame,
  cleanGame,
  addPlayAction,
} = gameSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectGameList = (state: RootState) => state.gameSlice.game

export default gameSlice.reducer

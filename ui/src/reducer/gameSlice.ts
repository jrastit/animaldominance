import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { GameListItemType, GameType } from '../type/gameType'

// Define a type for the slice state
interface GameState {
  gameId: number
  game: GameType | undefined
  gameList: GameListItemType[]
  gameVersion: number
}

// Define the initial state using that type
const initialState: GameState = {
  gameId: 0,
  game: undefined,
  gameList: [],
  gameVersion: 0
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
    setGameId: (state, action: PayloadAction<number>) => {
      state.gameId = action.payload
    },
    setGameVersion: (state, action: PayloadAction<number>) => {
      state.gameVersion = action.payload
    },
    setGame: (state, action: PayloadAction<GameType>) => {
      state.game = action.payload
    },
    clearGame: (state) => {
      state.game = undefined
      state.gameId = 0
      state.gameVersion = 0
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
  setGameId,
  setGameVersion,
  clearGame
} = gameSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectGameList = (state: RootState) => state.gameSlice.game

export default gameSlice.reducer

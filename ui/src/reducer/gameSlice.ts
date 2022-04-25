import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { GameListItemType, GameType } from '../type/gameType'

// Define a type for the slice state
interface GameState {
  game: GameType | undefined
  gameList: GameListItemType[]
}

// Define the initial state using that type
const initialState: GameState = {
  game: undefined,
  gameList: [],
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
    setGameList: (state, action: PayloadAction<GameListItemType[]>) => {
      action.payload.forEach(game => _addGame(state, game))
    },
    clearGameList: (state) => {
      state.gameList = []
    },
    setGame: (state, action: PayloadAction<GameType>) => {
      state.game = action.payload
    },
    clearGame: (state) => {
      state.game = undefined
    }
  },
})

export const {
  addGameList,
  fillGameList,
  setGameList,
  clearGameList,
  setGame,
  clearGame
} = gameSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectGameList = (state: RootState) => state.gameSlice.game

export default gameSlice.reducer

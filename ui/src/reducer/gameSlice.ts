import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { GameType } from '../type/gameType'

// Define a type for the slice state
interface GameState {
  game: GameType | undefined
  gameList: GameType[] | undefined
}

// Define the initial state using that type
const initialState: GameState = {
  game: undefined,
  gameList: undefined,
}

export const gameSlice = createSlice({
  name: 'game',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setGameList: (state, action: PayloadAction<GameType[]>) => {
      state.gameList = action.payload
    },
    clearGameList: (state) => {
      state.gameList = undefined
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
  setGameList,
  clearGameList,
  setGame,
  clearGame
} = gameSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectGameList = (state: RootState) => state.gameSlice.game

export default gameSlice.reducer

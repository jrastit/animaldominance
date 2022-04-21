import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { CardType } from '../type/cardType'

// Define a type for the slice state
interface CardListState {
  cardList: Array<CardType>
}

// Define the initial state using that type
const initialState: CardListState = {
  cardList: [],
}

export const cardListSlice = createSlice({
  name: 'cardList',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setCardList: (state, action: PayloadAction<CardType[]>) => {
      state.cardList = action.payload
    },
    addCard: (state, action: PayloadAction<CardType>) => {
      if (state.cardList.filter(card => card.id === action.payload.id).length === 0) {
        state.cardList.push(action.payload)
      }
    },
    clearCardList: (state) => {
      state.cardList = []
    }
  },
})

export const { addCard, setCardList, clearCardList } = cardListSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCardList = (state: RootState) => state.cardListSlice.cardList

export default cardListSlice.reducer

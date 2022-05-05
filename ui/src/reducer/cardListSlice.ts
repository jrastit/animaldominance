import ethers from 'ethers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { CardType } from '../type/cardType'
import type { TradeType } from '../type/tradeType'

// Define a type for the slice state
interface CardListState {
  cardList: Array<CardType>
  tradeList: TradeType[][][] | undefined
}

// Define the initial state using that type
const initialState: CardListState = {
  cardList: [],
  tradeList: undefined
}

export const cardListSlice = createSlice({
  name: 'cardList',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setTradeList: (state, action: PayloadAction<TradeType[][][]>) => {
      state.tradeList = action.payload
    },
    addTrade: (state, action: PayloadAction<{ cardId: number, level: number, userId: number, userCardId: number, price: ethers.BigNumber }>) => {
      if (state.tradeList) {
        const _tradeList = state.tradeList[action.payload.cardId][action.payload.level]
        const trade = _tradeList.filter(_trade => _trade.userId === action.payload.userId && _trade.userCardId === action.payload.userCardId)[0]
        if (trade) {
          trade.price = action.payload.price
        } else {
          _tradeList.push({
            userId: action.payload.userId,
            userCardId: action.payload.userCardId,
            price: action.payload.price,
          })
        }
      }
    },
    removeTrade: (state, action: PayloadAction<{ cardId: number, level: number, userId: number, userCardId: number }>) => {
      if (state.tradeList) {
        const _tradeList = state.tradeList[action.payload.cardId][action.payload.level]
        state.tradeList[action.payload.cardId][action.payload.level] = _tradeList.filter(_trade => _trade.userId !== action.payload.userId || _trade.userCardId !== action.payload.userCardId)
      }
    },
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
      state.tradeList = undefined
    }
  },
})

export const {
  setTradeList,
  addTrade,
  removeTrade,
  addCard,
  setCardList,
  clearCardList
} = cardListSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCardList = (state: RootState) => state.cardListSlice.cardList

export default cardListSlice.reducer

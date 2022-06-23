import { BigNumber } from 'ethers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserType, UserCardType, UserDeckType } from '../type/userType'

// Define a type for the slice state
interface UserState {
  user: UserType | undefined
  userCardList: UserCardType[] | undefined
  userDeckList: UserDeckType[] | undefined
}

// Define the initial state using that type
const initialState: UserState = {
  user: undefined,
  userCardList: undefined,
  userDeckList: undefined,
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUserDeckList: (state, action: PayloadAction<UserDeckType[]>) => {
      state.userDeckList = action.payload
    },
    clearUserDeckList: (state) => {
      state.userDeckList = undefined
    },
    updateNftId: (state, action: PayloadAction<{ id: BigNumber, userCardId: number }>) => {
      if (!state.userCardList) {
        throw Error('User Card list not set')
      }
      const newUserCardList = state.userCardList.concat([])
      const userCard = newUserCardList.filter((_userCard) => _userCard.id === action.payload.userCardId)[0]
      if (!userCard) {
        throw Error('User Card not found ' + action.payload.userCardId)
      }
      userCard.nftId = action.payload.id
      userCard.sold = true
      state.userCardList = newUserCardList
    },
    setUserCardList: (state, action: PayloadAction<UserCardType[]>) => {
      state.userCardList = action.payload
    },
    clearUserCardList: (state) => {
      state.userCardList = undefined
    },
    addUserCard: (state, action: PayloadAction<{ cardId: number, exp: number }>) => {
      if (!state.userCardList) {
        throw Error('User Card list not set')
      }
      state.userCardList = state.userCardList.concat([{
        id: state.userCardList.length + 1,
        cardId: action.payload.cardId,
        exp: action.payload.exp,
        expWin: 0,
        price: 0,
        sold: false,
        nftId: BigNumber.from(0)
      }])
    },
    setUser: (state, action: PayloadAction<UserType>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = undefined
    }
  },
})

export const {
  updateNftId,
  setUserDeckList,
  clearUserDeckList,
  setUserCardList,
  clearUserCardList,
  setUser,
  clearUser,
  addUserCard,
} = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUserList = (state: RootState) => state.userSlice.user

export default userSlice.reducer

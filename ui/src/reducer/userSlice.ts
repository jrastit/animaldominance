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

    setUserCardList: (state, action: PayloadAction<UserCardType[]>) => {
      state.userCardList = action.payload
    },
    clearUserCardList: (state) => {
      state.userCardList = undefined
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
  setUserDeckList,
  clearUserDeckList,
  setUserCardList,
  clearUserCardList,
  setUser,
  clearUser
} = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUserList = (state: RootState) => state.userSlice.user

export default userSlice.reducer

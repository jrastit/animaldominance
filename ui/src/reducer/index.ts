import { combineReducers } from "redux"
import cardListSlice from './cardListSlice'
import userSlice from './userSlice'
import gameSlice from './gameSlice'
import contractSlice from './contractSlice'
import walletSlice from './walletSlice'

export default combineReducers({
  cardListSlice,
  userSlice,
  gameSlice,
  contractSlice,
  walletSlice,
})

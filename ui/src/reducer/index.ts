import { combineReducers } from "redux"
import cardListSlice from './cardListSlice'
import userSlice from './userSlice'

export default combineReducers({
  cardListSlice,
  userSlice,
})

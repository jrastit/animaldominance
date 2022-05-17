import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { WalletInfo } from '../type/walletInfo'
import type { WalletType } from '../type/walletType'
import type { NetworkType } from '../type/networkType'

// Define a type for the slice state
interface UserState {
  wallet: WalletInfo,
  network: NetworkType | undefined,
  password: {
    password: string | undefined,
    passwordCheck: string | undefined
  },
  walletList: WalletType[]
}

// Define the initial state using that type
const initialState: UserState = {
  wallet: {},
  network: undefined,
  password: {
    password: undefined,
    passwordCheck: undefined
  },
  walletList: []
}

export const walletSlice = createSlice({
  name: 'wallet',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setPassword: (state, action: PayloadAction<string | undefined>) => {
      state.password.password = action.payload
    },
    setPasswordCheck: (state, action: PayloadAction<{ password: string | undefined, passwordCheck: string | undefined }>) => {
      state.password = action.payload
    },
    setWallet: (state, action: PayloadAction<WalletInfo>) => {
      state.wallet = action.payload
    },
    setWalletList: (state, action: PayloadAction<WalletType[] | undefined>) => {
      if (action.payload)
        state.walletList = action.payload
      else
        state.walletList = []
    },
    setNetwork: (state, action: PayloadAction<NetworkType | undefined>) => {
      state.network = action.payload
    },
    setBalance: (state, action: PayloadAction<{ address: string, balance: number | undefined }>) => {
      if (state.wallet.address === action.payload.address) {
        state.wallet.balance = action.payload.balance
      }
    },
    clearPassword: (state) => {
      state.password.password = undefined
    },
    clearWallet: (state) => {
      state.wallet = {}
    },
    clearWalletList: (state) => {
      state.walletList = []
    },
    clearNetwork: (state) => {
      state.network = undefined
    }
  },
})

export const {
  setBalance,
  setWallet,
  setWalletList,
  setNetwork,
  setPassword,
  setPasswordCheck,
  clearWallet,
  clearWalletList,
  clearNetwork,
  clearPassword,
} = walletSlice.actions

export default walletSlice.reducer

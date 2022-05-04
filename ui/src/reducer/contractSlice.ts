import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StepType {
  id: number,
  step: number,
  message: string | undefined,
  error: string | undefined,
}

export enum StepId {
  Contract,
  CardList,
  User,
  UserCardList,
  UserDeckList,
  GameList,
  Game,
}

export enum Step {
  Init,
  Loading,
  Creating,
  Waiting,
  Joining,
  Running,
  Refresh,
  Update,
  Ended,
  Ready,
  Clean,
  NotSet,
  Empty,
  Ok,
  Error,
}

// Define a type for the slice state
interface ContractState {
  step: StepType[]
  version: number
}

// Define the initial state using that type
const initialState: ContractState = {
  step: [
    { id: StepId.Contract, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.CardList, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.User, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.UserCardList, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.UserDeckList, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.GameList, step: Step.Init, message: undefined, error: undefined },
    { id: StepId.Game, step: Step.Init, message: undefined, error: undefined },
  ],
  version: 0,
}

export const contractSlice = createSlice({
  name: 'contract',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    resetAllSubStep: (state) => {
      state.step.forEach((step) => {
        if (step.id !== StepId.Contract) {
          step.step = Step.Init
          step.message = undefined
          step.error = undefined
        }
      })
      state.version = state.version + 1
    },
    resetAllStep: (state) => {
      state.step.forEach((step) => {
        step.step = Step.Init
        step.message = undefined
        step.error = undefined
      })
      state.version = state.version + 1
    },

    updateStep: (state, action: PayloadAction<{ id: number, step: number }>) => {
      state.step.forEach((step) => {
        if (step.id === action.payload.id) {
          step.step = action.payload.step
          step.message = undefined
          step.error = undefined
          state.version = state.version + 1
        }
      })

    },
    clearError: (state, action: PayloadAction<number>) => {
      state.step.forEach((step) => {
        if (step.id === action.payload) {
          step.step = Step.Init
          step.message = undefined
          step.error = undefined
          state.version = state.version + 1
        }
      })
    },
    setError: (state, action: PayloadAction<{ id: number, error?: string, catchError?: Error }>) => {
      let error = action.payload.error
      if (action.payload.catchError) {
        error = action.payload.catchError.message
      }
      console.error(error)
      state.step.forEach((step) => {
        if (step.id === action.payload.id) {
          step.step = Step.Error
          step.message = undefined
          step.error = error
          state.version = state.version + 1
        }
      })
    },
    setMessage: (state, action: PayloadAction<{ id: number, message: string | undefined }>) => {
      state.step.forEach((step) => {
        if (step.id === action.payload.id) {
          step.message = action.payload.message
        }
      })
    },
  }
})

export const {
  updateStep,
  clearError,
  setError,
  setMessage,
  resetAllStep,
  resetAllSubStep,
} = contractSlice.actions

export const getStep = function(id: number, stepState: StepType[]) {
  return stepState.filter(_step => _step.id === id)[0]
}

export const isStep = function(id: number, step: number, stepState: StepType[]) {
  return getStep(id, stepState).step === step
}

export const isInit = function(id: number, stepState: StepType[]) {
  return getStep(id, stepState).step === Step.Init
}

export const isOk = function(id: number, stepState: StepType[]) {
  return getStep(id, stepState).step === Step.Ok
}

export default contractSlice.reducer

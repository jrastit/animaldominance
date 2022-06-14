import { ethers } from 'ethers'

import { useEffect, useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import TimerSemaphore from '../util/TimerSemaphore'
import { NetworkType } from '../type/networkType'

import {
  Step,
  StepId,
  isInit,
  updateStep,
  updateStepIf,
  setError,
  resetAllStep,
} from '../reducer/contractSlice'

import {
  walletListLoadAddress,
  walletStorageLoad,
} from '../util/walletStorage'

import {
  setWallet,
  setWalletList,
  setNetwork,
  setPasswordCheck,
  setBalance,
} from '../reducer/walletSlice'

import {
  getWeb3Wallet,
  addHooks,
  getProvider,
  getNetwork,
  getWalletList,
} from '../util/networkInfo'

import { useAppSelector, useAppDispatch } from '../hooks'

const refreshBalance = async (
  dispatch: any,
  transactionManager: TransactionManager,
) => {
  const _balance = parseFloat(
    ethers.utils.formatEther(
      await transactionManager.getBalance()
    )
  )
  dispatch(
    setBalance({
      address: await transactionManager.getAddress(),
      balance: _balance
    })
  )
  if (_balance){
    dispatch(updateStepIf({ id: StepId.Wallet, ifStep: Step.NoBalance, step: Step.Init }))
  }
  return _balance
}

const setTransactionManagerUpdate = async (
  dispatch: any,
  provider: ethers.providers.Provider,
  timer : NodeJS.Timeout | undefined,
  setTimer : (timer : NodeJS.Timeout) => void,
  setTransactionManager: (transactionManager: TransactionManager) => void,
  network : NetworkType,
  signer : ethers.Signer
) => {
  let timerSemaphore
  if (network.timeBetweenRequest) {
    timerSemaphore = new TimerSemaphore(
      network.timeBetweenRequest,
      network.retry,
    )
  }
  const transactionManager = new TransactionManager(
    signer,
    timerSemaphore,
  )
  setTransactionManager(transactionManager)
  const balance = refreshBalance(dispatch, transactionManager)
  provider.removeAllListeners()
  if (timer) {
    clearTimeout(timer)
  }
  if (network.refreshBalance) {
    setTimer(setInterval(() => {
      if (transactionManager) {
        refreshBalance(dispatch, transactionManager)
      }
    }, network.refreshBalance))
  } else {
    provider.on('block', () => {
      refreshBalance(dispatch, transactionManager)
    })
  }
  return balance
}

const loadWalletFromBroswer = async (
  dispatch: any,
  password: { password: string | undefined, passwordCheck: string | undefined },
  setTransactionManager: (transactionManager: TransactionManager) => void,
  timer : NodeJS.Timeout | undefined,
  setTimer : (timer : NodeJS.Timeout) => void
) => {
  dispatch(updateStep({ id: StepId.Wallet, step: Step.Loading }))
  const walletStorage = walletStorageLoad()
  try {
    switch (walletStorage.walletType) {
      case 'Broswer':
        dispatch(setWallet({
          type: 'Broswer',
        }))
        dispatch(setPasswordCheck({
          password: password.password? password.password : walletStorage.password,
          passwordCheck: walletStorage.passwordCheck
        }))
        if (!password.password) {
          password = {
            password: walletStorage.password,
            passwordCheck: walletStorage.passwordCheck,
          }
        }
        if (password.password) {
          if (walletStorage.walletAddress) {
            dispatch(setWalletList(await getWalletList(password.password)))
            const walletStorageWithKey = await walletListLoadAddress(
              walletStorage.walletAddress,
              password.password
            )
            if (walletStorageWithKey) {
              dispatch(setWallet({
                type: 'Broswer',
                name: walletStorageWithKey.name,
                address: walletStorageWithKey.address,
              }))
              let balance
              if (walletStorageWithKey.pkey) {
                const _network = await getNetwork(walletStorage.chainId)
                if (_network) {
                  dispatch(setNetwork(_network))
                  const setErrorWallet = (error: string) => {
                    setError({ id: StepId.Wallet, error })
                  }
                  const provider = await getProvider(_network, setErrorWallet)
                  if (provider) {
                    const balance = await setTransactionManagerUpdate(
                      dispatch,
                      provider,
                      timer,
                      setTimer,
                      setTransactionManager,
                      _network,
                      new ethers.Wallet(
                        walletStorageWithKey.pkey,
                        provider
                      ),
                    )
                    if (!balance) {
                      dispatch(updateStep({ id: StepId.Wallet, step: Step.NoBalance }))
                      return
                    }
                  }
                } else {
                  dispatch(updateStep({ id: StepId.Wallet, step: Step.NoNetwork }))
                  return
                }
              }
              dispatch(setWallet({
                type: 'Broswer',
                name: walletStorageWithKey.name,
                address: walletStorageWithKey.address,
                balance,
              }))
              dispatch(resetAllStep())
              dispatch(updateStep({ id: StepId.Wallet, step: Step.Ok }))
            } else {
              dispatch(updateStep({ id: StepId.Wallet, step: Step.NoAddress }))
            }
          } else {
            dispatch(updateStep({ id: StepId.Wallet, step: Step.NoAddress }))
          }
        } else {
          dispatch(updateStep({ id: StepId.Wallet, step: Step.NoPassword }))
        }
        break
      case 'Metamask':
        dispatch(setWallet({
          type: 'Metamask',
        }))
        const web3Wallet = await getWeb3Wallet()
        const address = await web3Wallet.signer.getAddress()
        if (web3Wallet.network){
          dispatch(setNetwork(web3Wallet.network))
          dispatch(setWallet({
            type: 'Metamask',
            address,
          }))
          dispatch(resetAllStep())
          dispatch(updateStep({ id: StepId.Wallet, step: Step.Ok }))
          const balance = await setTransactionManagerUpdate(
            dispatch,
            web3Wallet.signer.provider,
            timer,
            setTimer,
            setTransactionManager,
            web3Wallet.network,
            web3Wallet.signer,
          )
          if (!balance) {
            dispatch(updateStep({ id: StepId.Wallet, step: Step.NoBalance }))
            return
          }
          addHooks()
        } else {
          dispatch(updateStep({ id: StepId.Wallet, step: Step.NoNetwork }))
          return
        }
        break
      default:
        dispatch(updateStep({ id: StepId.Wallet, step: Step.NotSet }))
    }
  } catch (err: any) {
    console.error(err)
    dispatch(setError({ id: StepId.Wallet, error: err.toString() }))
  }
}

const WalletLoader = (props: {
  transactionManager: TransactionManager | undefined
  setTransactionManager: (transactionManager: TransactionManager) => void
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const password = useAppSelector((state) => state.walletSlice.password)
  const [timer, setTimer] = useState<NodeJS.Timeout>()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isInit(StepId.Wallet, step)) {
      loadWalletFromBroswer(
        dispatch,
        password,
        props.setTransactionManager,
        timer,
        setTimer
      )
    }
  }, [
      timer,
      dispatch,
      step,
      password,
      props.setTransactionManager,
    ])

  return (<></>)
}



export default WalletLoader

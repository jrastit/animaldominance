import { ethers } from 'ethers'

import { useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import TimerSemaphore from '../util/TimerSemaphore'

import {
  Step,
  StepId,
  isInit,
  updateStep,
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
  //console.log('refreshBalance', await transactionManager.getAddress(), _balance)
  dispatch(
    setBalance({
      address : await transactionManager.getAddress(),
      balance : _balance
    }

    )
  )
}

const loadWalletFromBroswer = async (
  dispatch: any,
  password: { password: string | undefined, passwordCheck: string | undefined },
  setTransactionManager: (transactionManager: TransactionManager) => void
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
          password: password.password ? password.password : walletStorage.password,
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
              if (walletStorageWithKey.pkey) {
                const _network = await getNetwork(walletStorage.chainId)
                dispatch(setNetwork(_network))
                const setErrorWallet = (error: string) => {
                  setError({ id: StepId.Wallet, error })
                }
                const provider = await getProvider(_network, setErrorWallet)
                if (provider) {
                  let timerSemaphore
                  if (_network?.timeBetweenRequest){
                    timerSemaphore = new TimerSemaphore(
                      _network.timeBetweenRequest,
                      _network?.retry
                    )
                  }
                  const transactionManager = new TransactionManager(
                    new ethers.Wallet(
                      walletStorageWithKey.pkey,
                      provider
                    ),
                    timerSemaphore,

                  )
                  setTransactionManager(transactionManager)
                  refreshBalance(dispatch, transactionManager)
                  provider.removeAllListeners()
                  if (!_network?.refreshBalance){
                    provider.on('block', () => {
                      refreshBalance(dispatch, transactionManager)
                    })
                  }
                }
              }
              dispatch(setWallet({
                type: 'Broswer',
                name: walletStorageWithKey.name,
                address: walletStorageWithKey.address,
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
        dispatch(setNetwork(web3Wallet.network))
        dispatch(setWallet({
          type: 'Metamask',
          address,
        }))
        dispatch(resetAllStep())
        dispatch(updateStep({ id: StepId.Wallet, step: Step.Ok }))
        let timerSemaphore
        if (web3Wallet.network?.timeBetweenRequest){
          timerSemaphore = new TimerSemaphore(
            web3Wallet.network.timeBetweenRequest,
            web3Wallet.network?.retry,
          )
        }
        const transactionManager = new TransactionManager(
          web3Wallet.signer,
          timerSemaphore,
        )
        setTransactionManager(transactionManager)
        refreshBalance(dispatch, transactionManager)
        web3Wallet.signer.provider.removeAllListeners()
        if (!web3Wallet.network?.refreshBalance){
          web3Wallet.signer.provider.on('block', () => {
            refreshBalance(dispatch, transactionManager)
          });
        }
        addHooks()
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
  transactionManager : TransactionManager | undefined
  setTransactionManager: (transactionManager: TransactionManager) => void
}) => {

  const step = useAppSelector((state) => state.contractSlice.step)
  const password = useAppSelector((state) => state.walletSlice.password)
  const network = useAppSelector((state) => state.walletSlice.network)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isInit(StepId.Wallet, step)) {
      loadWalletFromBroswer(
        dispatch,
        password,
        props.setTransactionManager
      )
    }
  }, [
      dispatch,
      step,
      password,
      props.setTransactionManager,
    ])

      useEffect(() => {
        if (network?.refreshBalance && props.transactionManager){
        const timer = setInterval(() => {
          if (props.transactionManager){
            refreshBalance(dispatch, props.transactionManager)
          }
        }, network.refreshBalance)

        return () => clearTimeout(timer)
      }
    }, [
      dispatch,
      props.transactionManager
    ])




  return (<></>)
}



export default WalletLoader

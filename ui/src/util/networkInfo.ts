import { ethers } from 'ethers'

//import { network as networkList } from '../config/network.json'
import { NetworkType } from '../type/networkType'
import { WalletType } from '../type/walletType'
import { walletListLoad } from '../util/walletStorage'

declare global {
  interface Window {
    ethereum: any;
  }
}

export const switchNetwork = (network: NetworkType) => {
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x" + network.chainId.toString(16),
      rpcUrls: [network.url],
      chainName: network.name,
      nativeCurrency: {
        name: network.tokenName,
        symbol: network.tokenName,
        decimals: 18
      },
    }]
  });
}

export const getNetworkList = async (): Promise<NetworkType[]> => {
  const networkList = require('../config/network.json').network as NetworkType[]
  return networkList.filter((_network) => {
    if (!_network.host) {
      return true
    }
    return _network.host === window.location.hostname
  }).sort(
    (a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)
  )
}

export const getNetwork = async (chainId: number | undefined): Promise<NetworkType | undefined> => {
  const networkList = await getNetworkList()
  if (!chainId) return undefined
  return networkList.filter((network: any) => network.chainId === chainId)[0]
}

export const getWalletList = async (password: string): Promise<WalletType[] | undefined> => {
  return await walletListLoad(password)
}

export const getProvider = async (network: NetworkType | undefined, setError: (error: string) => void) => {
  try {
    if (network) {
      const provider = new ethers.providers.StaticJsonRpcProvider(network.url)
      provider.pollingInterval = 10000
      return provider
    } else {
      console.error("error in get network : network not set", )
    }
  } catch (error: any) {
    console.error("error in get network ", error)
    setError("Error in Metamask : " + error.message)
  }
}

export const addHooks = () => {
  window.ethereum.on('chainChanged', (_chainId: number) => window.location.reload());
  window.ethereum.on('accountsChanged', (accounts: Array<string>) => { console.log(accounts); window.location.reload() });
}

export const getEntityRegistryAddress = (
  networkName: string,
) => {
  const networkList = require('../config/network.json').network as any
  return (networkList as NetworkType[]).filter((_networkItem) => _networkItem.name === networkName).map((_networkItem) => _networkItem.entityRegistryAddress)[0]
}

export const getWeb3Wallet = async () => {
  const web3Provider = new ethers.providers.Web3Provider(
    window.ethereum)
  const _network = await web3Provider.getNetwork()
  const signer = web3Provider.getSigner()
  const chainId = _network.chainId
  const network = await getNetwork(chainId)
  return { network, signer }
}

export const getAddress = (
  networkName: string,
  wallet: ethers.Wallet,
  setAddress: (
    networkName: string | undefined,
    address: string,
    wallet: ethers.Wallet | undefined) => void,
) => {
  wallet.getAddress().then(
    (address) => {
      setAddress(networkName, address, wallet)
    }).catch(
      err => {
        console.error("error in get address ", err)
        setAddress(undefined, "error", undefined)
      }
    )
}

export const getBalance = async (
  wallet: ethers.Wallet,
  address: string,
  setBalance: (balance: ethers.BigNumber) => void
) => {
  wallet.provider.getBalance(address).then(
    (balance) => {
      setBalance(balance)
    }).catch(err => console.error("error in get balance ", err))
}

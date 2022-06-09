
type NetworkType = {
  name: string
  url: string
  chainId: number
  gameContract?: string
  blockExplorerTxPrefix?: string
  faucet?: string
  entityRegistryAddress?: string
  tokenName?: string
  contractDomainChainlink?: {
    linkAddress: string
    oracle: string
    jobId: string
  }
  timeBetweenRequest?: number
  retry?: number
  refreshBalance?: number
}

export type { NetworkType }

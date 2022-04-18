
type NetworkType = {
  name: string
  url: string
  chainId: number
  gameContract?: string
  blockExplorerTxPrefix?: string
  faucet?: string
  entityRegistryAddress?: string
  contractDomainChainlink?: {
    linkAddress: string,
    oracle: string,
    jobId: string,
  }
}

export type { NetworkType }

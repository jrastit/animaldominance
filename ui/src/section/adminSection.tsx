import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import CardExplorer from '../section/cardExplorer'
import { getNetworkList } from '../util/networkInfo'

import Button from 'react-bootstrap/Button'

import {
  createAllCard
} from '../game/card'

import {
  createWithManagerContractCardAdmin,
  getContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

const AdminSection = (props: {
  transactionManager : TransactionManager,
  networkName : string,
})=> {
  const [contract, setContract] = useState<ethers.Contract>()
  const [loading, setLoading] = useState(0)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!loading && !contract && props.networkName){
      console.log("admin section2")
      setLoading(1);
      getNetworkList().then((networkList) => {
        const network = networkList.filter(
          (network) => network.name === props.networkName
        )[0]
        if (network.gameContract){
          setContract(
            getContractCardAdmin(
              network.gameContract,
              props.transactionManager.signer
            )
          )
        }
        setLoading(2);
      })
    }
  }, [setLoading, contract, loading, props.networkName, props.transactionManager])

  const createContract = () => {
    setLoading(3);
    createWithManagerContractCardAdmin(props.transactionManager).then(async (contract) => {
      await createAllCard(contract, props.transactionManager)
      setContract(contract)
      setLoading(4)
    }).catch((_error) => {
      console.error(_error)
      setError(_error.toString())
    })
  }

  if (error) {
    return <p>{error}</p>
  }

  if (contract) {
    return (
      <CardExplorer
        transactionManager = {props.transactionManager}
        contract = {contract}
      />
    )
  }

  if (loading % 2 === 1) {
    return (
      <p>loading...</p>
    )
  }

  return (
    <Button variant="warning" onClick={() => createContract()}>Create contract</Button>
  )
}


export default AdminSection

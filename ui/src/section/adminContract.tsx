import * as ethers from 'ethers'
import { useState, useEffect } from 'react'
import { TransactionManager } from '../util/TransactionManager'
import { getNetworkList } from '../util/networkInfo'
import AddressWidget from '../component/addressWidget'
import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'


import Button from 'react-bootstrap/Button'

import {
  createAllCard
} from '../game/card'

import {
  createWithManagerContractCardAdmin,
  getContractCardAdmin,
} from '../contract/solidity/compiled/contractAutoFactory'

const AdminContract = (props : {
  transactionManager : TransactionManager,
  contract ?: ethers.Contract,
  setContract : (contract : ethers.Contract) => void,
  networkName : string,
}) => {

  const [loading, setLoading] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const [message, setMessage] = useState<string | undefined>()

  useEffect(() => {
    if (!loading && !props.contract && props.networkName){
      setLoading(1);
      getNetworkList().then((networkList) => {
        const network = networkList.filter(
          (network) => network.name === props.networkName
        )[0]
        if (network.gameContract){
          props.setContract(
            getContractCardAdmin(
              network.gameContract,
              props.transactionManager.signer
            )
          )
        }
        setLoading(2);
      })
    }
  }, [setLoading,loading, props])

  const createContract = () => {
    setLoading(3);
    createWithManagerContractCardAdmin(props.transactionManager).then(async (contract) => {
      await createAllCard(contract, props.transactionManager, setMessage)
      props.setContract(contract)
      setLoading(2)
    }).catch((_error) => {
      console.error(_error)
      setError(_error.toString())
    })
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title="Contract" hide={false}>
      { error &&
        <p>{error}</p>
      }
      { loading === 1 &&
          <div>loading...<br/>{message}</div>
      }
      { loading === 3 &&
          <div>Processing...<br/>{message}</div>
      }
      { !!props.contract &&
        <div>Contract <AddressWidget
          address={props.contract.address}
        /> on {props.networkName}</div>
      }
      { loading % 2 === 0 &&
        <SpaceWidget>
        <Button variant="warning" onClick={() => createContract()}>
          Create new game contract on {props.networkName}
        </Button>
        </SpaceWidget>
      }
    </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default AdminContract

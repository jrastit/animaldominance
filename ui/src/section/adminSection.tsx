import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import CardExplorer from '../section/cardExplorer'
import AdminUser from '../section/adminUser'
import AdminContract from '../section/adminContract'
import AdminUserCard from '../section/adminUserCard'

import type {
  UserType,
} from '../type/userType'

const AdminSection = (props: {
  transactionManager : TransactionManager,
  networkName : string,
})=> {
  const [contract, setContract] = useState<ethers.Contract>()
  const [user, setUser] = useState<UserType>()

  if (contract) {
    return (
      <>
      <AdminContract
        contract={contract}
        transactionManager={props.transactionManager}
        setContract={setContract}
        networkName={props.networkName}
      />
      <AdminUser
        user={user}
        contract={contract}
        transactionManager={props.transactionManager}
        setUser={setUser}
      />
      { !!user &&
        <AdminUserCard
          user={user}
          contract={contract}
          transactionManager={props.transactionManager}
        />
      }
      <CardExplorer
        transactionManager = {props.transactionManager}
        contract = {contract}
      />
      </>
    )
  }



  return (
    <>
    <AdminContract
      contract={contract}
      transactionManager={props.transactionManager}
      setContract={setContract}
      networkName={props.networkName}
    />
    <CardExplorer
      transactionManager = {props.transactionManager}
    />
    </>
  )
}


export default AdminSection

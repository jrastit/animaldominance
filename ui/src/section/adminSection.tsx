import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import AdminCard from './adminCard'
import AdminBlockchainCard from './adminBlockchainCard'
import AdminUser from '../section/adminUser'
import AdminContract from '../section/adminContract'
import AdminUserCard from '../section/adminUserCard'
import AdminDeck from '../section/adminDeck'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

const AdminSection = (props: {
  transactionManager : TransactionManager,
  networkName : string,
})=> {
  const [contract, setContract] = useState<ethers.Contract>()

  const user = useAppSelector((state) => state.userSlice.user)

  return (
    <Row>
      <Col>
        <AdminCard />
        <AdminContract
          contract={contract}
          transactionManager={props.transactionManager}
          setContract={setContract}
          networkName={props.networkName}
        />
        {!!contract &&
          <>
          <AdminUser
            contract={contract}
            transactionManager={props.transactionManager}
          />
          <AdminBlockchainCard
            contract={contract}
            transactionManager={props.transactionManager}
          />
          </>
        }
        {!!contract && !!user &&
          <>
          <AdminUserCard
            contract={contract}
            transactionManager={props.transactionManager}
          />
          <AdminDeck
            contract={contract}
            transactionManager={props.transactionManager}
          />
          </>
        }
      </Col>
    </Row>
  )

}


export default AdminSection

import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import AdminCard from './adminCard'
import AdminUser from '../section/adminUser'
import AdminContract from '../section/adminContract'
import AdminUserCardList from '../section/adminUserCardList'
import AdminUserDeckList from '../section/adminUserDeckList'
import AdminGameList from '../section/adminGameList'
import AdminGame from '../section/adminGame'
import ContractLoader from '../section/contractLoader'
import GameJoin from '../section/gameJoin'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

const AdminSection = (props: {
  transactionManager : TransactionManager,
  networkName : string,
})=> {
  const [contract, setContract] = useState<ethers.Contract>()

  const user = useAppSelector((state) => state.userSlice.user)
  const game = useAppSelector((state) => state.gameSlice.game)

  return (
    <>
    <Row>
      <Col>
        <ContractLoader
          contract={contract}
          transactionManager={props.transactionManager}
          setContract={setContract}
          networkName={props.networkName}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <AdminContract
          contract={contract}
          transactionManager={props.transactionManager}
          setContract={setContract}
          networkName={props.networkName}
        />
        {!!contract &&
          <>
          <AdminCard />
          <AdminGameList/>
          <AdminUser
            contract={contract}
            transactionManager={props.transactionManager}
          />
          </>
        }
        {!!contract && !!user &&
          <>
          <AdminUserCardList
            contract={contract}
            transactionManager={props.transactionManager}
          />
          <AdminUserDeckList
            contract={contract}
            transactionManager={props.transactionManager}
          />
          </>
        }
        { !!contract && !!game &&
          <AdminGame />
        }
      </Col>
      { !!contract && !!user &&
      <Col>
        <GameJoin
        contract={contract}
        transactionManager={props.transactionManager}
        />
      </Col>
      }
    </Row>
    </>
  )

}


export default AdminSection

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
import PlayGame from './playGame'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

import {
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

const AdminSection = (props: {
  transactionManager : TransactionManager,
  networkName : string,
})=> {
  const [contract, setContract] = useState<ethers.Contract>()
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const deckList = useAppSelector((state) => state.userSlice.userDeckList)
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
    { isStep(StepId.Game, Step.Init, step) &&
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
        { !!contract && !!user && deckList && (deckList.length > 0) &&
        <Col>
          <GameJoin
          contract={contract}
          transactionManager={props.transactionManager}
          />
        </Col>
        }
      </Row>
    }
    {
      !isStep(StepId.Game, Step.Init, step) && !!contract &&
      <PlayGame
      contract={contract}
      transactionManager={props.transactionManager}
      />
    }
    </>
  )

}


export default AdminSection

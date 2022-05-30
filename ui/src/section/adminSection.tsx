import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import { ContractCardAdmin } from '../contract/solidity/compiled/contractAutoFactory'
import { ContractTrading } from '../contract/solidity/compiled/contractAutoFactory'
import AdminCard from './adminCard'
import AdminTrade from './adminTrade'
import AdminUser from '../section/adminUser'
import AdminContract from '../section/adminContract'
import AdminUserCardList from '../section/adminUserCardList'
import AdminUserDeckList from '../section/adminUserDeckList'
import AdminGameList from '../section/adminGameList'
import AdminGame from '../section/adminGame'
import DisplayUserDeck from '../section/displayUserDeck'
import DisplayUserCard from '../section/displayUserCard'
import DisplayCard from '../section/displayCard'
import EditCard from '../section/editCard'
import ContractLoader from '../loader/contractLoader'
import GameJoin from '../section/gameJoin'
import PlayGame from './playGame'
import FindGame from './findGame'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import DivNice from '../component/divNice'

import { useAppSelector } from '../hooks'

import {
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

const AdminSection = (props: {
  section : string | undefined,
  transactionManager : TransactionManager,
})=> {
  const [contract, setContract] = useState<ContractCardAdmin>()
  const [tradingContract, setTradingContract] = useState<ContractTrading>()
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const deckList = useAppSelector((state) => state.userSlice.userDeckList)
  const game = useAppSelector((state) => state.gameSlice.game)

  const displayAdmin = () => {
    return (
      <Row>
        <Col>
          <AdminContract
            contract={contract}
            transactionManager={props.transactionManager}
            setContract={setContract}
          />
        </Col>
          {!!contract &&
            <Col>
            <AdminCard />
            <AdminTrade />
            <AdminGameList/>
            </Col>
          }
          {!!contract &&
            <Col>
            <AdminUser
              contract={contract}
            />
            {!!contract && !!user &&
              <>
              <AdminUserCardList
                contract={contract}
              />
              <AdminUserDeckList
                contract={contract}
              />
              </>
            }
            { !!contract && !!game &&

              <AdminGame />

            }
            </Col>
          }



        { !!contract && !!user && deckList && (deckList.length > 0) &&
        <Col>
          <GameJoin
          contract={contract}
          />
        </Col>
        }
      </Row>
    )

  }

  const displayGame = () => {
    if (isStep(StepId.Game, Step.Init, step)){
      return (
        <FindGame
        contract={contract}
        setContract={setContract}
        transactionManager={props.transactionManager}
        />
      )
    }else{
      if (contract){
        return (
          <PlayGame
          contract={contract}
          />
        )
      }
      return (<DivNice>Error : Contract not set</DivNice>)
    }

  }

  const render = () => {
    switch (props.section){
      case 'admin':
      return displayAdmin()
      case 'editCard':
      return (
        <EditCard/>
      )
      case 'card':
      return (
        <DisplayCard
        contract={contract}
        />
      )
      case 'userCard':
      if (contract){
        return (<DisplayUserCard
            contract={contract}
          />)
      } else {
        return (<p>Contract not set</p>)
      }

      case 'userDeck':
      if (contract) {
        return (<DisplayUserDeck
          contract={contract}
          />)
      } else {
        return displayGame()
      }

      default :
      return displayGame()
    }
  }

  return (
    <>
    <Row>
      <Col>
        <ContractLoader
          contract={contract}
          transactionManager={props.transactionManager}
          setContract={setContract}
          tradingContract={tradingContract}
          setTradingContract={setTradingContract}
        />
      </Col>
    </Row>
    {render()}
    </>
  )

}


export default AdminSection

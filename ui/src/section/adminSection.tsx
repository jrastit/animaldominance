import * as ethers from 'ethers'
import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
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
  const [contract, setContract] = useState<ethers.Contract>()
  const [tradingContract, setTradingContract] = useState<ethers.Contract>()
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
              transactionManager={props.transactionManager}
            />
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
          }



        { !!contract && !!user && deckList && (deckList.length > 0) &&
        <Col>
          <GameJoin
          contract={contract}
          transactionManager={props.transactionManager}
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
        transactionManager={props.transactionManager}
        setContract={setContract}
        />
      )
    }else{
      if (contract){
        return (
          <PlayGame
          contract={contract}
          transactionManager={props.transactionManager}
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
        transactionManager={props.transactionManager}
        />
      )
      case 'userCard':
      if (contract){
        return (<DisplayUserCard
            contract={contract}
            transactionManager={props.transactionManager}
          />)
      } else {
        return (<p>Contract not set</p>)
      }

      case 'userDeck':
      if (contract) {
        return (<DisplayUserDeck
          contract={contract}
          transactionManager={props.transactionManager}
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

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

import { ContractHandlerType, newContractHandler } from '../type/contractType'

import {
  isStep,
  StepId,
  Step,
} from '../reducer/contractSlice'

const AdminSection = (props: {
  section : string | undefined,
  transactionManager : TransactionManager,
})=> {
  const [contractHandler, _setContractHandler] = useState<ContractHandlerType>(
    newContractHandler(props.transactionManager)
  )
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const deckList = useAppSelector((state) => state.userSlice.userDeckList)
  const game = useAppSelector((state) => state.gameSlice.game)

  const contract = contractHandler.gameManager.contract

  const displayAdmin = () => {
    return (
      <Row>
        <Col>
          <AdminContract
            contractHandler={contractHandler}
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
        contractHandler={contractHandler}
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
          contractHandler={contractHandler}
        />
      </Col>
    </Row>
    {render()}
    </>
  )

}


export default AdminSection

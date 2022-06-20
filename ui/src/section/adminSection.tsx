import { useState } from 'react'

import { TransactionManager } from '../util/TransactionManager'
import AdminCard from './adminCard'
import AdminTrade from './adminTrade'
import AdminNFT from './adminNFT'
import AdminUser from '../section/adminUser'
import AdminContract from '../section/adminContract'
import AdminUserCardList from '../section/adminUserCardList'
import AdminUserDeckList from '../section/adminUserDeckList'
import AdminGameList from '../section/adminGameList'
import AdminGame from '../section/adminGame'
import DisplayUserDeck from '../section/displayUserDeck'
import DisplayUserCard from '../section/displayUserCard'
import DisplayNFT from '../section/displayNFT'
import DisplayCard from '../section/displayCard'
import EditCard from '../section/editCard'
import ContractLoader from '../loader/contractLoader'
import GameJoin from '../section/gameJoin'
import PlayGame from './playGame'
import FindGame from './findGame'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { useAppSelector } from '../hooks'

import { ContractHandlerType, newContractHandler } from '../type/contractType'

import {
  isStep,
  StepId,
  Step,
  isOk,
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

  const displayAdmin = () => {
    return (
      <Row>
        <Col>
          <AdminContract
            contractHandler={contractHandler}
          />
        </Col>
            {isOk(StepId.Contract, step) &&
              <>
              <Col>
              <AdminCard />
              <AdminTrade />
              <AdminNFT />
              <AdminGameList/>
              </Col>


              <Col>
              <AdminUser
                contractHandler={contractHandler}
              />
              {!!user &&
                <>
                <AdminUserCardList
                  contractHandler={contractHandler}
                />
                <AdminUserDeckList
                  contractHandler={contractHandler}
                />
                </>
              }
              { !!game &&
                <AdminGame />

              }
              </Col>
              { !!user && deckList && (deckList.length > 0) &&
              <Col>
                <GameJoin
                contractHandler={contractHandler}
                />
              </Col>
              }
              </>
            }

      </Row>
    )

  }

  const displayGame = () => {
    if (isStep(StepId.Game, Step.Init, step) || isStep(StepId.Game, Step.NotSet, step)){
      return (
        <FindGame
        contractHandler={contractHandler}
        />
      )
    }else{
        return (
          <PlayGame
          contractHandler={contractHandler}
          />
        )
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
        contractHandler={contractHandler}
        />
      )
      case 'userCard':
        return (<DisplayUserCard
            contractHandler={contractHandler}
          />)
      case 'NFT':
        return (<DisplayNFT
            contractHandler={contractHandler}
        />)
      case 'userDeck':
        return (<DisplayUserDeck
          contractHandler={contractHandler}
          />)
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

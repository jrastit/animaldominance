import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import {
  getLevel,
  listCard,
  cancelListCard,
} from '../game/card'

import type {
  UserCardType,
} from '../type/userType'

import {
  updateStep,
  Step,
  StepId
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Alert from 'react-bootstrap/Alert'
import ButtonNice from '../component/buttonNice'
import DivFullNice from '../component/divFullNice'

const DisplayUserCard = (props: {
  contract: ethers.Contract,
  transactionManager: TransactionManager,
}) => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const dispatch = useAppDispatch()

  const [sellCard, setSellCard] = useState<{
    userCardId: number,
    price?: number,
  }>()
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const userCardListToSplit = userCardList ? userCardList.concat([]).sort((card1, card2) => {
    return card2.exp - card1.exp
  }) : []

  const userCardListBash = [] as UserCardType[][]
  for (let i = 0; i < userCardListToSplit.length; i = i + 6) {
    userCardListBash.push(userCardListToSplit.slice(i, i + 6))
  }

  const _listCart = (_userCardId: number) => {
    if (sellCard && sellCard.price) {
      setLoading(true)
      listCard(
        props.contract,
        props.transactionManager,
        _userCardId,
        sellCard.price
      ).then(() => {
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
        setSellCard(undefined)
        setLoading(false)
      }
      ).catch((err) => {
        setSellCard(undefined)
        setLoading(false)
        setError(err.toString())
      })
    } else {
      setError("Sell card not set")
    }

  }

  const _cancelListCard = (_userCardId: number) => {
    setLoading(true)
    cancelListCard(
      props.contract,
      props.transactionManager,
      _userCardId
    ).then(() => {
      dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
      setError(err.toString())
    })
  }

  const renderSellCard = (userCardListItem: UserCardType[]) => {
    if (sellCard) {
      const userCard = userCardListItem.filter((userCard) => userCard.id === sellCard.userCardId)[0]
      if (userCard) {
        const card = cardList.filter(card => card.id === userCard.cardId)[0]
        const level = getLevel(userCard.exp)
        return (
          <>
            <div>
              Selling {card.name} level {level} ({userCard.exp})
            </div>
            <div>
              Your price in ROSE
              <FormControl onChange={(e) => {
                setSellCard({
                  userCardId: sellCard.userCardId,
                  price: parseFloat(e.target.value),
                })
              }}></FormControl>
            </div>
            {!!sellCard.price &&
              <>
                <div>
                  Your price is {sellCard.price} ROSE
              </div>
                <div>
                  Animal Comission is {sellCard.price * 5 / 100} ROSE
              </div>
                <div>
                  Game Comission is {sellCard.price * 5 / 100} ROSE
              </div>
                <div>
                  XP Comission is {sellCard.price * 10 / 100} ROSE
              </div>
                <div>
                  Final price is {sellCard.price * 120 / 100} ROSE
              </div>
                <Button onClick={() => { _listCart(userCard.id) }}>List {card.name} level {level} for {sellCard.price * 120 / 100} ROSE</Button>
              </>
            }
            <div>
              <Button variant='warning' onClick={() => { setSellCard(undefined) }}>Cancel</Button>
            </div>
          </>
        )
      }
    }
  }

  const renderRow = (userCardListItem: UserCardType[], id: number) => {
    return (
      <Row key={id}>
        <Col xs={3}>
          <DivFullNice>
            {error &&
              <>
                <Alert variant='danger'>{error}</Alert>
                <Button onClick={() => { setError(undefined) }}>Ok</Button>
              </>
            }
            {!loading && !error &&
              <>
                {!sellCard && userCardListItem.map((userCard) => {
                  const card = cardList.filter(card => card.id === userCard.cardId)[0]
                  const level = getLevel(userCard.exp)
                  if (level > 0){
                    if (!userCard.price) {
                      return (
                        <div key={userCard.id} style={{margin : '.25em'}}>
                          <ButtonNice onClick={() => { setSellCard({ userCardId: userCard.id }) }}>
                            Sell {card.name} level {level} ({userCard.exp})
                          </ButtonNice>
                        </div>
                      )
                    } else if (!userCard.sold) {
                      return (
                        <div key={userCard.id}  style={{margin : '.25em'}}>
                          <div>
                            Selling {card.name} level {level} ({userCard.exp}) for {userCard.price} ROSE
                        &nbsp;&nbsp;<Button
                              variant='danger'
                              onClick={() => { _cancelListCard(userCard.id) }}
                            >
                              Cancel
                        </Button>
                          </div>
                        </div>
                      )
                    } else{
                      return (<div  style={{margin : '.25em'}}>Sold {card.name} level {level} ({userCard.exp}) for {userCard.price} ROSE</div>)
                    }
                  }

                  return (<div></div>)
                })
                }
                {!!sellCard &&
                  renderSellCard(userCardListItem)
                }
              </>
            }
            {loading &&
              <p>Loading...</p>
            }
          </DivFullNice>
        </Col>
        <Col xs={9}>
          <UserCardListWidget
            userCardList={userCardListItem}
          />
        </Col>
      </Row>
    )
  }


  return (
    <>
      {userCardListBash.map((userCardListItem, id) => {
        return renderRow(userCardListItem, id)
      })}
    </>
  )

}

export default DisplayUserCard

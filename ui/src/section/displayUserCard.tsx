import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import {
  getLevel
} from '../game/card'

import type {
  UserCardType,
} from '../type/userType'

import { useAppSelector } from '../hooks'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import Alert from 'react-bootstrap/Alert'

const DisplayUserCard = () => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)

  const [sellCard, setSellCard] = useState<{
    userCardId : number,
    price ?: number,
  }>()
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<boolean>()

  const userCardListToSplit = userCardList? userCardList.concat([]).sort((card1, card2) => {
    return card2.exp - card1.exp
  }) : []

  const userCardListBash = [] as UserCardType[][]
  for (let i = 0; i < userCardListToSplit.length; i = i + 6){
    userCardListBash.push(userCardListToSplit.slice(i,i + 6))
  }
  console.log(userCardListBash)
  /*
  while (userCardListToSplit.length) {

  }
  */

  const renderSellCard = (userCardListItem : UserCardType[]) => {
    if (sellCard){
      const userCard = userCardListItem.filter((userCard) => userCard.id === sellCard.userCardId)[0]
      if (userCard){
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
                  userCardId : sellCard.userCardId,
                  price : parseFloat(e.target.value),
                })
              }}></FormControl>
            </div>
            { !!sellCard.price &&
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
              <Button onClick={() => {}}>Sell it for {sellCard.price} ROSE</Button>
              </>
            }
            <div>
            <Button variant='warning' onClick={() => {setSellCard(undefined)}}>Cancel</Button>
            </div>
          </>
        )
      }
    }
  }

  const renderRow = (userCardListItem : UserCardType[], id : number) => {
    return (
      <Row key={id}>
        <Col xs={3}>
        <div>
          {error &&
            <>
            <Alert variant='danger'>{error}</Alert>
            <Button onClick={() => {setError(undefined)}}>Ok</Button>
            </>
          }
          {!loading &&
            <>
            { !sellCard && userCardListItem.map((userCard) => {
              const card = cardList.filter(card => card.id === userCard.cardId)[0]
              const level = getLevel(userCard.exp)
              if (level > 0){
                return (
                  <div style={{marginBottom : '.5em'}}>
                    <Button key={userCard.id} onClick={() => {setSellCard({userCardId : userCard.id})}}>
                      Sell {card.name} level {level} ({userCard.exp})
                    </Button>
                  </div>
                )
              }
              return (<div></div>)
            })
            }
            { !!sellCard &&
              renderSellCard(userCardListItem)
            }
            </>
          }
          {loading &&
            <p>Loading...</p>
          }
        </div>
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

import { ContractHandlerType } from '../type/contractType'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import type {
  UserCardType,
} from '../type/userType'

import { useAppSelector } from '../hooks'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import DivFullNice from '../component/divFullNice'

const DisplayNFT = (props: {
  contractHandler : ContractHandlerType,
}) => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)

  const [loading, _setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const userCardListToSplit = userCardList ? userCardList.concat([]).filter((userCard) => {
    return !userCard.nftId.eq(0)
  }).sort((card1, card2) => {
    return card2.exp - card1.exp
  }) : []

  const userCardListBash = [] as UserCardType[][]
  for (let i = 0; i < userCardListToSplit.length; i = i + 6) {
    userCardListBash.push(userCardListToSplit.slice(i, i + 6))
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

export default DisplayNFT

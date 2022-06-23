import { BigNumber } from 'ethers'
import { ContractHandlerType } from '../type/contractType'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import type {
  NftType,
} from '../type/tradeType'

import {
  nftBurnCard
} from '../game/reducer/nft'

import { useAppSelector, useAppDispatch } from '../hooks'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import DivFullNice from '../component/divFullNice'
import Container from 'react-bootstrap/Container'

const DisplayNFT = (props: {
  contractHandler : ContractHandlerType,
}) => {
  const dispatch = useAppDispatch()
  const nftList = useAppSelector((state) => state.cardListSlice.nftList)

  const [loading, _setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const nftListToSplit = nftList ? nftList.concat([]).sort((nft1, nft2) => {
    return nft2.exp - nft1.exp
  }) : []

  const nftListBash = [] as NftType[][]
  for (let i = 0; i < nftListToSplit.length; i = i + 6) {
    nftListBash.push(nftListToSplit.slice(i, i + 6))
  }

  const renderRow = (nftListItem: NftType[], id: number) => {
    return (
      <Row key={id}>
        <Col>
          <UserCardListWidget
            userCardList={nftListItem.map(nft => {
              return {
                ...nft,
                id : 0,
                expWin : 0,
                price : 0,
                sold : false,
                nftId : nft.id,
              }
            })}
            nftBurnCard={(nftId : BigNumber) => {nftBurnCard(dispatch, props.contractHandler, nftId)}}
          />
        </Col>
      </Row>
    )
  }

  return (
    <Container style={{fontSize : '0.9em'}}>
    { (error || loading) &&
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
    }

      {nftListBash.map((userCardListItem, id) => {
        return renderRow(userCardListItem, id)
      })}
    </Container>
  )

}

export default DisplayNFT

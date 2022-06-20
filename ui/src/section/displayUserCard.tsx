import { ContractHandlerType } from '../type/contractType'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import {
  getLevel,
  listCard,
  cancelListCard,
} from '../game/card'

import {
  nftCreateCard,
} from '../game/nft'

import {
  updateNftId,
} from '../reducer/userSlice'

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
  contractHandler : ContractHandlerType,
}) => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const tokenName = network?.tokenName

  const [sellCard, setSellCard] = useState<{
    userCardId: number,
    price?: number,
  }>()
  const [createNFT, setCreateNFT] = useState<number>()
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const userCardListToSplit = userCardList ? userCardList.concat([]).filter((userCard) => {
    return !userCard.sold && userCard.nftId.eq(0)
  }).sort((card1, card2) => {
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
        props.contractHandler,
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

  const _createNFT = (_userCardId: number) => {
    if (createNFT) {
      setLoading(true)
      nftCreateCard(
        props.contractHandler,
        _userCardId,
      ).then((nftId) => {
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
        dispatch(updateNftId({ id: nftId, userCardId: _userCardId }))
        setCreateNFT(undefined)
        setLoading(false)
      }
      ).catch((err) => {
        setCreateNFT(0)
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
      props.contractHandler,
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
              Your price in {tokenName}
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
                  Your price is {sellCard.price} {tokenName}
              </div>
                <div>
                  Animal Comission is {sellCard.price * 5 / 100} {tokenName}
              </div>
                <div>
                  Game Comission is {sellCard.price * 5 / 100} {tokenName}
              </div>
                <div>
                  XP Comission is {sellCard.price * 10 / 100} {tokenName}
              </div>
                <div>
                  Final price is {sellCard.price * 120 / 100} {tokenName}
              </div>
                <Button onClick={() => { _listCart(userCard.id) }}>List {card.name} level {level} for {sellCard.price * 120 / 100} {tokenName}</Button>
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

  const renderCreateNFT = (userCardListItem: UserCardType[]) => {
    if (createNFT) {
      const userCard = userCardListItem.filter((userCard) => userCard.id === createNFT)[0]
      if (userCard) {
        const card = cardList.filter(card => card.id === userCard.cardId)[0]
        const level = getLevel(userCard.exp)
        return (
          <>
            <div>
              Creating NFT for {card.name} level {level} ({userCard.exp})
            </div>
            <Button onClick={() => { _createNFT(createNFT) }}>Create NFT</Button>
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
                {!sellCard && !createNFT && userCardListItem.map((userCard) => {
                  const card = cardList.filter(card => card.id === userCard.cardId)[0]
                  const level = getLevel(userCard.exp)
                  if (level > 0){
                    if (!userCard.price && !userCard.sold) {
                      return (
                        <div key={userCard.id} style={{margin : '.25em'}}>
                          {card?.name} level {level} ({userCard.exp}) &nbsp;
                          <ButtonNice onClick={() => { setSellCard({ userCardId: userCard.id }) }}>
                            Sell
                          </ButtonNice>&nbsp;
                          <ButtonNice onClick={() => { setCreateNFT(userCard.id) }}>
                            NFT
                          </ButtonNice>
                        </div>
                      )
                    } else if (!userCard.sold) {
                      return (
                        <div key={userCard.id}  style={{margin : '.25em'}}>
                          <div>
                            Selling {card.name} level {level} ({userCard.exp}) for {userCard.price} {tokenName}
                        &nbsp;&nbsp;<Button
                              variant='danger'
                              onClick={() => { _cancelListCard(userCard.id) }}
                            >
                              Cancel
                        </Button>
                          </div>
                        </div>
                      )
                    } else if (userCard.nftId){
                      return (<div  key={userCard.id} style={{margin : '.25em'}}>NFT {userCard.nftId.toString()} {card.name} level {level} ({userCard.exp})</div>)
                    } else {
                      return (<div  key={userCard.id} style={{margin : '.25em'}}>Sold {card.name} level {level} ({userCard.exp}) for {userCard.price} {tokenName}</div>)
                    }
                  }

                  return (<div  key={userCard.id} ></div>)
                })
                }
                {!!sellCard &&
                  renderSellCard(userCardListItem)
                }
                {!!createNFT &&
                  renderCreateNFT(userCardListItem)
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

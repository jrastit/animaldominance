import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState, useEffect } from 'react'

import {
  updateUserDeck,
  addUserDeck,
} from '../game/user'

import type {
  UserCardType,
} from '../type/userType'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  UserDeckType
} from '../type/userType'

import {
  setUserDeckList
} from '../reducer/userSlice'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import DeckSelect from '../game/component/deckSelect'

const DisplayUserDeck = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const dispatch = useAppDispatch()
  const [userCardSubList, setUserCardSubList] = useState<UserCardType[]>([])
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<boolean>()

  const [deck, setDeck] = useState<UserDeckType | undefined>(
    userDeckList ? userDeckList[0] : undefined
  )

  const [resetSelection, setResetSelection] = useState<boolean>(false)

  const selectCard = (userCard : UserCardType) => {
    const length = userCardSubList.length
    const list = userCardSubList.filter(_userCard => _userCard.id !== userCard.id)
    if (list.length === length){
      const list2 = userCardSubList.filter(_userCard => _userCard.cardId === userCard.cardId)
      if (list2.length < 2){
        list.push(userCard)
      }
    }
    setUserCardSubList(list)
  }

  const _updateDeck = async () => {
    setLoading(true)
    try{
      if (deck){
        const newDeck = await updateUserDeck(props.contract, props.transactionManager, deck.id, userCardSubList)
        if (userDeckList){
          dispatch(setUserDeckList(userDeckList.map(oldDeck => {
            if (oldDeck.id === newDeck.id) return newDeck
            return oldDeck
          })))
        } else {
          dispatch(setUserDeckList([newDeck]))
        }
        setDeck(newDeck)
      } else {
        const newDeck = await addUserDeck(props.contract, props.transactionManager, userCardSubList)
        if (userDeckList){
          dispatch(setUserDeckList(userDeckList.concat([newDeck])))
        } else {
          dispatch(setUserDeckList([newDeck]))
        }
        setDeck(newDeck)
      }
    } catch (err : any){
      setError(err.toString())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (userCardList){
      setResetSelection(false)
      if (deck){
        setUserCardSubList(deck.userCardIdList.map((id) => {
          return userCardList.filter((userCard) => userCard.id === id)[0]
        }).filter(userCard => !userCard.price))
      } else {
        setUserCardSubList([])
      }

    }
  }, [deck, userCardList, resetSelection])

  if (userCardList) {
    return (
      <Row>
        <Col xs={3}>
        <div>
        <DeckSelect
          userDeckList={userDeckList}
          setDeck={setDeck}
          deck={deck}
        />
        </div>
        <div>
        {userCardSubList.length} card selected {userCardSubList.length === 20 ? "" : "(need 20 to update deck)"}
        </div>
        <div>
        <Button onClick={() => {setResetSelection(true)}}>Reset selection</Button>
        </div>
        {!!userCardSubList.length &&
          <div>
            {error &&
              <div>
              <Alert variant='danger'>{error}</Alert>
              <Button variant='danger' onClick={() => {setError(undefined)}}>Ok</Button>
              </div>
            }
            {!error && !loading && userCardSubList.length === 20 &&
              <Button onClick={() => {_updateDeck()}}>Update deck</Button>
            }
            {loading &&
              <p>Loading...</p>
            }
          </div>
        }
        </Col>
        <Col xs={9}>
        <UserCardListWidget
          userCardList={userCardList.concat([]).sort((card1, card2) => {
            return card2.exp - card1.exp
          }).filter(card => !card.price)}
          selectCard={selectCard}
          userCardSubList={userCardSubList}
        />
        </Col>
      </Row>
    )
  }

  return (<></>)
}

export default DisplayUserDeck

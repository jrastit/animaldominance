import { ContractHandlerType } from '../type/contractType'

import UserCardListWidget from '../game/component/userCardListWidget'

import { useState, useEffect } from 'react'

import ButtonNice from '../component/buttonNice'
import DivFullNice from '../component/divFullNice'
import SpaceWidget from '../component/spaceWidget'

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
import Container from 'react-bootstrap/Container'

const DisplayUserDeck = (props : {
  contractHandler : ContractHandlerType,
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
        const newDeck = await updateUserDeck(props.contractHandler, deck.id, userCardSubList)
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
        const newDeck = await addUserDeck(props.contractHandler, userCardSubList)
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
        }).filter(userCard => (!userCard.price && !userCard.sold && userCard.nftId.eq(0))))
      } else {
        setUserCardSubList([])
      }

    }
  }, [deck, userCardList, resetSelection])

  if (userCardList) {
    return (
      <Container>
      <Row>
        <Col>
        <DivFullNice>
        <SpaceWidget>
        <DeckSelect
          userDeckList={userDeckList}
          setDeck={setDeck}
          deck={deck}
        />

        {userCardSubList.length} card selected {userCardSubList.length === 20 ? "" : "(need 20 to update deck)"}

        &nbsp;<ButtonNice onClick={() => {setResetSelection(true)}}>Reset selection</ButtonNice>

        {!!userCardSubList.length &&
          <>
            {error &&
              <div>
              <Alert variant='danger'>{error}</Alert>
              <Button variant='danger' onClick={() => {setError(undefined)}}>Ok</Button>
              </div>
            }
            {!error && !loading && userCardSubList.length === 20 &&
              <>&nbsp;<ButtonNice onClick={() => {_updateDeck()}}>Update deck</ButtonNice></>
            }
            {loading &&
              <p>Loading...</p>
            }
          </>
        }
        </SpaceWidget>
        </DivFullNice>
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize:'.9em'}}>
        <UserCardListWidget
          userCardList={userCardList.concat([]).sort((card1, card2) => {
            return card2.exp - card1.exp
          }).filter(card => !card.price && !card.sold && card.nftId.eq(0))}
          selectCard={selectCard}
          userCardSubList={userCardSubList}
        />
        </Col>
      </Row>
      </Container>
    )
  }

  return (<></>)
}

export default DisplayUserDeck

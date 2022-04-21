import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

import {
  getUserDeckList,
  addUserDefaultDeck,
} from '../game/user'

import { setUserDeckList } from '../reducer/userSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

const AdminDeck = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {

  const user = useAppSelector((state) => state.userSlice.user)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(0)

  //const dispatch = useAppDispatch()

  useEffect(() => {
    if (!loading && user){
      setLoading(1)
      getUserDeckList(props.contract, user.id).then((_userDeckList) => {
        dispatch(setUserDeckList(_userDeckList))
        setLoading(2);
      }).catch((err) => {
        console.error(err)
        setLoading(2);
      })
    }
  }, [setLoading, loading, props, user, dispatch])

  const render = () => {
    if (loading === 1) {
       return (<div>Loading cards</div>)
    } else if (loading === 2) {
      if (userDeckList && userDeckList.length > 0){
        return (<div>{userDeckList.length} {userDeckList.length > 1?"Decks":"Deck"}</div>)
      } else if (user && userCardList){
        return (
          <Button variant="primary" onClick={() => {
            addUserDefaultDeck(
              props.contract,
              props.transactionManager,
              userCardList,
            ).then(() => {
              setLoading(0)
            })
          }}>
            Get default deck
          </Button>
        )
      } else {
        return (<div>error user not set</div>)
      }
    } else {
      return (<div>Admin deck</div>)
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Decks' hide={false}>
        { render() }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminDeck

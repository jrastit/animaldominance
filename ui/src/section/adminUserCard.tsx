import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import type {
  UserType,
  UserCardType,
} from '../type/userType'

import {
  getUserCardList,
  addUserStarterCard,
} from '../game/user'

const AdminUserCard = (props : {
  user : UserType,
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {

  const [loading, setLoading] = useState(0)
  const [userCardList, setUserCardList] = useState<UserCardType[]>()

  useEffect(() => {
    if (!loading){
      setLoading(1)
      getUserCardList(props.contract, props.user.id).then((_userCardList) => {
        setUserCardList(_userCardList)
        setLoading(2);
      }).catch((err) => {
        console.error(err)
        setLoading(2);
      })
    }
  }, [setLoading, loading, props])

  if (loading === 1) return (
    <div>Loading cards</div>
  )

  if (userCardList && userCardList.length > 0) return (
    <div>Nb user cards : {userCardList.length}</div>
  )

  if (userCardList) return (
    <Button variant="warning" onClick={() => {
      addUserStarterCard(
        props.contract,
        props.transactionManager,
        props.user.id
      ).then(() => {
        setLoading(0)
      })
    }}>
      Get card to play
    </Button>
  )

  return (<div>Admin user card</div>)
}

export default AdminUserCard

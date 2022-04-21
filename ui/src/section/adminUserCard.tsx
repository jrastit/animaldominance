import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

import {
  getUserCardList,
  addUserStarterCard,
} from '../game/user'

import { setUserCardList } from '../reducer/userSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

const AdminUserCard = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {

  const user = useAppSelector((state) => state.userSlice.user)
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(0)

  //const dispatch = useAppDispatch()

  useEffect(() => {
    if (!loading && user){
      setLoading(1)
      getUserCardList(props.contract, user.id).then((_userCardList) => {
        dispatch(setUserCardList(_userCardList))
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
      if (userCardList && userCardList.length > 0){
        return (<div>{userCardList.length} Cards</div>)
      } else if (user){
        return (
          <Button variant="primary" onClick={() => {
            addUserStarterCard(
              props.contract,
              props.transactionManager,
              user.id
            ).then(() => {
              setLoading(0)
            })
          }}>
            Get card to play
          </Button>
        )
      } else {
        return (<div>error user not set</div>)
      }
    } else {
      return (<div>Admin user card</div>)
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='My cards' hide={false}>
        { render() }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminUserCard

import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import UserWidget from '../game/component/userWidget'
import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'

import {
  getUserId,
  getUser,
  registerUser,
} from '../game/user'

import { setUser } from '../reducer/userSlice'
import { useAppSelector, useAppDispatch } from '../hooks'

const AdminUser = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {

  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(0)
  const [name, setName] = useState<string>()

  useEffect(() => {
    if (!loading && !user){
      setLoading(1)
      getUserId(props.contract).then((userId) => {
        if (userId){
          getUser(props.contract, userId).then((user) => {
            dispatch(setUser(user))
              setLoading(2);
          }).catch((err) => {
            console.error(err)
            setLoading(2);
          })
        } else {
          setLoading(2);
        }
      }).catch((err) => {
        console.error(err)
        setLoading(2);
      })
    }
  }, [setLoading, loading, user, props.contract, props, dispatch])

  const render=() => {
    if (loading === 1){
      return (<div>Loading user</div>)
    }
    if (loading === 2 && !user){
      return (
        <div>
        <div>User not registered</div>
        <div>Enter a name to register</div>
        <div>
        <FormControl onChange={(e) => {
          setName(e.target.value)
        }}></FormControl>
        </div>
        <div>
        { !!name &&
          <Button onClick={
            (_e) => {
              registerUser(props.contract, props.transactionManager, name).then(() => {
                setLoading(0)
              })
            }
          }>Register</Button>
        }
        </div>
        </div>
      )
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title="user" hide={false}>
        {user &&
          <UserWidget user={user} />
        }
        { render() }
      </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default AdminUser

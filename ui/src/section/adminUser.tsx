import * as ethers from 'ethers'
import { useState, useEffect } from 'react'

import { TransactionManager } from '../util/TransactionManager'

import UserWidget from '../game/component/userWidget'

import type {
  UserType,
} from '../type/userType'

import {
  getUserId,
  getUser,
  registerUser,
} from '../game/user'

const AdminUser = (props : {
  user ?: UserType,
  contract : ethers.Contract,
  transactionManager : TransactionManager,
  setUser : (user : UserType) => void
}) => {

  const [loading, setLoading] = useState(0)
  const [name, setName] = useState<string>()

  useEffect(() => {
    if (!loading && !props.user){
      setLoading(1)
      getUserId(props.contract).then((userId) => {
        if (userId){
          getUser(props.contract, userId).then((user) => {
            props.setUser(user)
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
  }, [setLoading, loading, props.user, props.contract, props.setUser, props])

  if (props.user) {
    return <UserWidget
      user={props.user}
    />
  }

  if (loading === 1) {
    return <div>Loading user</div>
  }

  return (
    <div>
    <div>User not registered</div>
    <div>Enter a name to register</div>
    <div>
    <input onChange={(e) => {
      setName(e.target.value)
    }}></input>
    </div>
    <div>
    { !!name &&
      <button onClick={
        (_e) => {
          registerUser(props.contract, props.transactionManager, name).then(() => {
            setLoading(0)
          })
        }
      }>Register</button>
    }
    </div>
    </div>
  )
}

export default AdminUser

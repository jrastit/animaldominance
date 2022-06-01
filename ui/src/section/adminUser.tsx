import { useState } from 'react'
import {ContractGameManager} from '../contract/solidity/compiled/contractAutoFactory'

import UserWidget from '../game/component/userWidget'
import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'

import FormControl from 'react-bootstrap/FormControl'
import Button from 'react-bootstrap/Button'
import StepMessageWidget from '../component/stepMessageWidget'


import {
  registerUser,
} from '../game/user'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  setError,
  clearError,
  StepId,
  Step,
  isStep,
  getStep,
} from '../reducer/contractSlice'

const AdminUser = (props : {
  contract : ContractGameManager,
}) => {
  const stepId = StepId.User
  const user = useAppSelector((state) => state.userSlice.user)
  const step = useAppSelector((state) => state.contractSlice.step)
  const dispatch = useAppDispatch()

  const [name, setName] = useState<string>()

  const _registerUser = () => {
    if (name){
      dispatch(updateStep({id : stepId, step : Step.Loading}))
      registerUser(props.contract, name).then(() => {
        dispatch(clearError(stepId))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title="User" hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        {user &&
          <UserWidget user={user} />
        }
        { isStep(stepId, Step.NotSet, step) &&
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
            <Button onClick={_registerUser}>Register</Button>
          }
          </div>
          </div>
        }
      </BoxWidgetHide>
    </SpaceWidget>
  )
}

export default AdminUser

import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import {
  addUserStarterCard,
} from '../game/user'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  setError,
  clearError,
  getStep,
  StepId,
  Step,
  isStep,
} from '../reducer/contractSlice'

const AdminUserCardList = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const stepId = StepId.UserCardList
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const dispatch = useAppDispatch()

  const _addUserStarterDeck = () => {
    if (user){
      dispatch(updateStep({id : stepId, step : Step.Loading}))
      addUserStarterCard(
        props.contract,
        props.transactionManager,
        user.id
      ).then(() => {
        dispatch(clearError(stepId))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='My cards' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
        />
        { isStep(stepId, Step.Ok, step) && userCardList &&
          <div>{userCardList.length} Cards</div>
        }
        {isStep(stepId, Step.Empty, step) && userCardList &&
          <Button variant="primary" onClick={_addUserStarterDeck}>
            Get card to play
          </Button>
        }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminUserCardList

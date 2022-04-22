import * as ethers from 'ethers'

import { TransactionManager } from '../util/TransactionManager'

import Button from 'react-bootstrap/Button'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import {
  addUserDefaultDeck,
} from '../game/user'

import {
  updateStep,
  setError,
  StepId,
  Step,
  isStep,
  getStep,
} from '../reducer/contractSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const AdminUserDeckList = (props : {
  contract : ethers.Contract,
  transactionManager : TransactionManager,
}) => {
  const stepId = StepId.UserDeckList
  const step = useAppSelector((state) => state.contractSlice.step)
  const userDeckList = useAppSelector((state) => state.userSlice.userDeckList)
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)
  const dispatch = useAppDispatch()

  const _addUserDefaultDeck = () => {
    dispatch(updateStep({id: stepId, step: Step.Creating}))
    if (userCardList){
      addUserDefaultDeck(
        props.contract,
        props.transactionManager,
        userCardList,
      ).then(() => {
        dispatch(updateStep({id: stepId, step: Step.Ok}))
      }).catch((err) => {
        dispatch(setError({id : stepId, catchError : err}))
      })
    }
  }

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Decks' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
        />
        { isStep(stepId, Step.Ok, step) && userDeckList &&
          <div>{userDeckList.length} {userDeckList.length > 1?"Decks":"Deck"}</div>
        }
        { isStep(stepId, Step.Empty, step) &&
          isStep(StepId.UserCardList, Step.Ok, step) &&
          <Button variant="primary" onClick={_addUserDefaultDeck}>
            Get default deck
          </Button>
        }
      </BoxWidgetHide>
    </SpaceWidget>
  )


}

export default AdminUserDeckList

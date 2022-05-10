import * as ethers from 'ethers'
import { TransactionManager } from '../util/TransactionManager'
import { useState } from 'react'
import CardListWidget from '../game/component/cardListWidget'

import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  Step,
  StepId,
  isOk,
} from '../reducer/contractSlice'

import {
  setCard,
  setCardLevel,
} from '../reducer/cardListSlice'

import Button from 'react-bootstrap/Button'
import SpaceWidget from '../component/spaceWidget'
import Alert from 'react-bootstrap/Alert'

const DisplayCard = (props: {
  contract?: ethers.Contract,
  transactionManager: TransactionManager,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const tradeList = useAppSelector((state) => state.cardListSlice.tradeList)
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const refresh = () => {
    if (isOk(StepId.Trading, step)) {
      dispatch(updateStep({ id: StepId.Trading, step: Step.Ready }))
    }

  }

  const _setCard = (card : {
    cardId: number,
    mana: number,
    family: number,
    starter: number,
    name: string
  }) => {
    dispatch(setCard(card))
  }

  const _setCardLevel = (level : {
    cardId: number,
    level: number,
    attack: number,
    life: number,
    description: string
  }) => {
    dispatch(setCardLevel(level))
  }

  if (cardList) {
    return (
      <div>
        {false && isOk(StepId.Trading, step) &&
          <SpaceWidget><Button onClick={refresh}>Refresh trade</Button></SpaceWidget>
        }
        {error &&
          <>
            <Alert variant='danger'>{error}</Alert>
            <Button onClick={() => { setError(undefined) }}>Ok</Button>
          </>
        }
        {loading &&
          <p>Loading...</p>
        }
        {!loading && !error &&
          <CardListWidget
            cardList={cardList}
            tradeList={tradeList}
            userId={user?.id}
            setCard={_setCard}
            setCardLevel={_setCardLevel}
          />
        }

      </div>
    )
  }

  return (<></>)
}

export default DisplayCard

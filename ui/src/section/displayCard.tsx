import * as ethers from 'ethers'
import { TransactionManager } from '../util/TransactionManager'
import { useState } from 'react'
import CardListWidget from '../game/component/cardListWidget'

import { buyNewCard } from '../game/card'
import { useAppSelector, useAppDispatch } from '../hooks'

import {
  updateStep,
  Step,
  StepId,
  isOk,
} from '../reducer/contractSlice'

import Button from 'react-bootstrap/Button'
import SpaceWidget from '../component/spaceWidget'
import Alert from 'react-bootstrap/Alert'

const DisplayCard = (props: {
  contract?: ethers.Contract,
  transactionManager: TransactionManager,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const step = useAppSelector((state) => state.contractSlice.step)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const _buyNewCard = (cardId: number, value: number) => {
    if (props.contract) {
      setLoading(true)
      buyNewCard(props.contract, props.transactionManager, cardId, value).then(() => {
        setLoading(false)
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
      }).catch((err) => {
        setLoading(false)
        setError(err.toString())
      })
    }
  }

  const refresh = () => {
    if (isOk(StepId.Trading, step)) {
      dispatch(updateStep({ id: StepId.Trading, step: Step.Ready }))
    }

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
            buyNewCard={props.contract && _buyNewCard}
            cardList={cardList}
          />
        }

      </div>
    )
  }

  return (<></>)
}

export default DisplayCard

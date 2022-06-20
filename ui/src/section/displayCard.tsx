import { BigNumber } from 'ethers'
import { useState } from 'react'
import CardListWidget from '../game/component/cardListWidget'
import { ContractHandlerType } from '../type/contractType'

import { buyNewCard, buyCard } from '../game/card'
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
  contractHandler : ContractHandlerType,
}) => {

  const cardList = useAppSelector((state) => state.cardListSlice.cardList)
  const tradeList = useAppSelector((state) => state.cardListSlice.tradeList)
  const step = useAppSelector((state) => state.contractSlice.step)
  const user = useAppSelector((state) => state.userSlice.user)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<string>()

  const _buyNewCard = (cardId: number, value: BigNumber) => {
      setLoading(true)
      buyNewCard(props.contractHandler, cardId, value).then(() => {
        setLoading(false)
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
      }).catch((err) => {
        setLoading(false)
        setError(err.toString())
      })
  }

  const _buyCard = (userId : number, userCardId: number, value: BigNumber) => {

      setLoading(true)
      buyCard(props.contractHandler, userId, userCardId, value).then(() => {
        setLoading(false)
        dispatch(updateStep({ id: StepId.UserCardList, step: Step.Init }))
      }).catch((err) => {
        setLoading(false)
        setError(err.toString())
      })
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
            buyNewCard={_buyNewCard}
            buyCard={_buyCard}
            cardList={cardList}
            tradeList={tradeList}
            userId={user?.id}
            tokenName={network?.tokenName}
          />
        }

      </div>
    )
  }

  return (<></>)
}

export default DisplayCard

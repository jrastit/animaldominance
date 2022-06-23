import { BigNumber } from 'ethers'

import { UserCardType } from '../../type/userType'

import {
  updateStep,
  setError,
  StepId,
  Step,
} from '../../reducer/contractSlice'

import {
  nftCreateCard as _nftCreateCard,
  nftBurnCard as _nftBurnCard,
  nftLoadHistorySelf,
} from '../../game/nft'

import {
  setNFTList,
  addNFT,
  removeNFT,
} from '../../reducer/cardListSlice'

import {
  addUserCard,
  updateNftId,
} from '../../reducer/userSlice'

import {
  ContractHandlerType
} from '../../type/contractType'

export const loadNFT = (
  dispatch: any,
  contractHandler: ContractHandlerType,
) => {
  const stepId = StepId.Nft
  dispatch(updateStep({ id: stepId, step: Step.Loading }))
  nftLoadHistorySelf(contractHandler).then(nftList => {
    dispatch(setNFTList(nftList))
    dispatch(updateStep({ id: stepId, step: Step.Ok }))
  }).catch((err) => {
    dispatch(setError({ id: stepId, catchError: err }))
  })
}

export const nftCreateCard = async (
  dispatch: any,
  contractHandler: ContractHandlerType,
  userCard: UserCardType,
) => {
  const nftId = await _nftCreateCard(
    contractHandler,
    userCard.id,
  )
  dispatch(updateNftId({ id: nftId, userCardId: userCard.id }))
  dispatch(addNFT({ id: nftId, exp: userCard.exp, owner: await contractHandler.transactionManager.getAddress(), cardId: userCard.cardId }))
}

export const nftBurnCard = async (
  dispatch: any,
  contractHandler: ContractHandlerType,
  nftId: BigNumber,
) => {
  const newUserCard = await _nftBurnCard(
    contractHandler,
    nftId,
  )
  dispatch(addUserCard(newUserCard))
  dispatch(removeNFT(nftId))
}

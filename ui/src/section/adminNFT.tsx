import { useAppSelector, useAppDispatch } from '../hooks'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import {
  getStep,
  StepId,
  clearError,
} from '../reducer/contractSlice'

const AdminNFT = ()=> {
  const stepId = StepId.Trading
  const step = useAppSelector((state) => state.contractSlice.step)
  const nftList = useAppSelector((state) => state.cardListSlice.nftList)
  const dispatch = useAppDispatch()

  return (
    <SpaceWidget>
      <BoxWidgetHide title='NFT Card' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        {nftList && nftList.length > 0 &&
          <>
            {nftList.length} nft card
          </>
        }
      </BoxWidgetHide>
    </SpaceWidget>
  )

}


export default AdminNFT

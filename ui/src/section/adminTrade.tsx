import { useAppSelector, useAppDispatch } from '../hooks'

import SpaceWidget from '../component/spaceWidget'
import BoxWidgetHide from '../component/boxWidgetHide'
import StepMessageWidget from '../component/stepMessageWidget'

import {
  TradeType,
} from '../type/tradeType'

import {
  getStep,
  StepId,
  clearError,
} from '../reducer/contractSlice'

const AdminTrade = ()=> {
  const stepId = StepId.Trading
  const user = useAppSelector((state) => state.userSlice.user)
  const step = useAppSelector((state) => state.contractSlice.step)
  const tradeList = useAppSelector((state) => state.cardListSlice.tradeList)
  const dispatch = useAppDispatch()

  const getNbTrade = (_tradeCardList : TradeType[][][] | undefined) => {
    let _nbTrade = 0
    let _nbUserTrade = 0
    if (_tradeCardList){
      _tradeCardList.forEach(_tradeLevelList => {
        _tradeLevelList.forEach(_tradeList =>{
          _tradeList.forEach(trade => {
            _nbTrade ++
            if (trade.userId === user?.id){
              _nbUserTrade++
            }
          })
        })
      })
    }
    return [_nbTrade, _nbUserTrade]
  }

  const [nbTrade, nbUserTrade] = getNbTrade(tradeList)

  return (
    <SpaceWidget>
      <BoxWidgetHide title='Trade Card' hide={false}>
        <StepMessageWidget
          step = {getStep(stepId, step)}
          resetStep = {() => {dispatch(clearError(stepId))}}
        />
        {tradeList && tradeList.length > 0 &&
          <>
            {nbTrade} total card to sell<br/>
            {nbUserTrade} user card to sell
          </>
        }
      </BoxWidgetHide>
    </SpaceWidget>
  )

}


export default AdminTrade

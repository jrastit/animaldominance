import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { getNetworkList } from '../../util/networkInfo'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  walletStorageSetNetworkId,
} from '../../util/walletStorage'

import {
  updateStep,
  Step,
  StepId,
} from '../../reducer/contractSlice'

const NetworkSelectWidget = () => {

  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const _setNetwork = async (event : {target : {name : string, value : string}}) => {
    _setNetwork2(parseInt(event.target.value))
  }

  const _setNetwork2 = async (chainId : number | undefined) => {
    if (chainId !== network?.chainId){
      walletStorageSetNetworkId(chainId)
      dispatch(updateStep({id : StepId.Wallet, step : Step.Init}))
    }
  }

  const [option, setOption] = useState<Array<{
    name: string
    value: string
  }>>([])

  useEffect(() => {
    if (option.length === 0) {
      getNetworkList().then(networkList => {
        const _option = networkList.map(network => {
          return {
            value: network.chainId.toString(),
            name: network.name,
          }
        })
        if (_option[0] && !network)
          _setNetwork2(parseInt(_option[0].value))
        setOption(_option)
      })
    }
  })

  return (
    <SelectWidget
      name='networkSelect'
      value={network?.chainId.toString()}
      onChange={_setNetwork}
      option={option}
    />
  )
}

export default NetworkSelectWidget

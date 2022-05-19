import { useState, useEffect } from 'react'
import SelectWidget from '../selectWidget'
import { getNetworkList } from '../../util/networkInfo'

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  switchNetwork,
  getNetwork,
} from '../../util/networkInfo'

import {
  updateStep,
  Step,
  StepId,
} from '../../reducer/contractSlice'

const NetworkSwitchWidget = () => {

  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const [error, setError] = useState()

  const _setNetwork = async (event : {target : {name : string, value : string}}) => {
    _setNetwork2(parseInt(event.target.value))
  }

  const _setNetwork2 = async (chainId : number | undefined) => {
    if (chainId !== network?.chainId){
      const _network = await getNetwork(chainId)
      if (_network){
        try {
          switchNetwork(_network)
        } catch (err : any) {
          setError(err.toString())
        }
        dispatch(updateStep({id : StepId.Wallet, step : Step.Init}))
      }
    }
  }

  const [option, setOption] = useState<Array<{
    name: string
    value: string
  }>>([])

  useEffect(() => {
    if (option.length === 0) {
      getNetworkList().then(networkList => {
        const _option = [{name:'', value:'0'}].concat(networkList.map(network => {
          return {
            value: network.chainId.toString(),
            name: network.name,
          }
        }))
        //if (_option[0] && !network && !error)
        //  _setNetwork2(parseInt(_option[0].value))
        setOption(_option)
      })
    }
  })

  return (
    <>
    {error}
    <SelectWidget
      name='networkSelect'
      value={network?.chainId.toString()}
      onChange={_setNetwork}
      option={option}
    />
    </>
  )
}

export default NetworkSwitchWidget

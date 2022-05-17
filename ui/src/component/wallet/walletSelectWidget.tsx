import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button';
import SelectWidget from '../selectWidget'
import BoxWidget from '../boxWidget'
import { walletNiceName } from '../../type/walletType'
import WalletAddWidget from './walletAddWidget'
import WalletInfoWidget from './walletInfoWidget'
import NetworkInfoWidget from './networkInfoWidget'
import WalletDelete from './walletDelete'
import BoxWidgetHide from '../boxWidgetHide'


import { useAppSelector, useAppDispatch } from '../../hooks'

import { WalletInfo } from '../../type/walletInfo'

import {
  updateStep,
  Step,
  StepId,
} from '../../reducer/contractSlice'

import {
  walletStorageSetWallet,
} from '../../util/walletStorage'

const _setWallet2 = (
  walletAddress : string | undefined,
  wallet : WalletInfo,
  dispatch : any,
) => {
  console.log(walletAddress)
  if (walletAddress !== wallet.address){
    walletStorageSetWallet(walletAddress)
    dispatch(updateStep({id : StepId.Wallet, step : Step.Init}))
  }
}

const WalletSelectWidget = (props: {
  setSection : (section : string) => void
}) => {

  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const walletList = useAppSelector((state) => state.walletSlice.walletList)
  const network = useAppSelector((state) => state.walletSlice.network)
  const dispatch = useAppDispatch()

  const [option, setOption] = useState<Array<{
    name: string,
    value: string,
  }>>([])

  const _setWallet = (event : {target : {name : string, value : string}}) => {
    _setWallet2(event.target.value, wallet, dispatch)
  }

  useEffect(() => {
    const _option = walletList.map(wallet => {
      return {
        value: wallet.address,
        name: walletNiceName(wallet),
      }
    })
    if (_option[0] && !wallet.address)
      _setWallet2(_option[0].value, wallet, dispatch)
    setOption(_option)
  }, [walletList, wallet, dispatch])



  return (
    <>
    { option.length > 0 &&
      <>
    <BoxWidget  title={"Select broswer wallet"}>
      <SelectWidget
        name='Select widget'
        value={wallet.address}
        onChange={_setWallet}
        option={option}
        />
      </BoxWidget>
      { wallet.address &&
        <>
        <BoxWidget  title={"Wallet for " + network?.name}>
        { network &&
          <NetworkInfoWidget
            network={network}
          />
        }
        { wallet &&
          <WalletInfoWidget
            wallet={wallet}
            network={network}
          />
        }
        <Button onClick={() => props.setSection('game')}>Ok</Button>
        </BoxWidget>
        <WalletDelete />
        </>
      }


      </>
    }
    <BoxWidgetHide title="Add broswer wallet" hide={option.length > 0}>
      <p>import your broswer wallet with the private key or generate a new one</p>
      <WalletAddWidget/>
    </BoxWidgetHide>
    </>
  )
}

export default WalletSelectWidget

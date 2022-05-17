import { WalletInfo } from '../../type/walletInfo'
import { NetworkType } from '../../type/networkType'
import AddressWidget from '../addressWidget'

const WalletInfoWidget = (props : {
  wallet : WalletInfo
  network ?: NetworkType | undefined
}) => {

  return (
    <>
    { !!props.wallet.address &&
      <p>Wallet address : <AddressWidget address={props.wallet.address}/></p>
    }
    { props.wallet.balance !== undefined &&
      <p>Wallet balance : {props.wallet.balance} {props.network?.tokenName}</p>
    }
    </>
  )
}

export default WalletInfoWidget

import { NetworkType } from '../../type/networkType'

const NetworkInfoWidget = (props : {
  network : NetworkType
}) => {

  return (
    <>
    <p>Network : {props.network.name}</p>
    <p>Chain Id : {props.network.chainId}</p>
    <p>Web3 URL : {props.network.url}</p>
    { props.network.faucet &&
      <>
      <p>Get more Test token with {props.network.name} faucet</p>
      <p>Faucet : <a href={props.network.faucet} target="_blank" rel="noreferrer">{props.network.faucet}</a></p>
      </>
    }
    </>
  )

}

export default NetworkInfoWidget

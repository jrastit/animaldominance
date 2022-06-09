import {ContractHandlerType} from '../../type/contractType'
import AddressWidget from '../../component/addressWidget'

const ContractInfoWidget = (props : {
  contractHandler : ContractHandlerType
}) => {

  const displayContract = (name : string, contract : {
      contract ?: {
        address : string
      },
      versionOk ?: boolean
    }) => {
    if (contract.contract)
      return (<div key={contract.contract.address}>
        {name}:
        &nbsp;<AddressWidget address={contract.contract.address}/>
        &nbsp;{
          contract.versionOk === undefined ?
          'undefined' : contract.versionOk?
          'Ok' : 'Error'
        }
        </div>)
  }

  const render = () => {
    const ret = []
    const animalDominance = displayContract('Animal Dominance', props.contractHandler.animalDominance)
    if (animalDominance){
      ret.push(animalDominance)
      const gameManager = displayContract('Game Manager', props.contractHandler.gameManager)
      if (gameManager){
        ret.push(gameManager)
        ret.push(displayContract('Play Action Lib', props.contractHandler.playActionLib))
        ret.push(displayContract('Play Game Factory', props.contractHandler.playGameFactory))
        ret.push(displayContract('Trading', props.contractHandler.trading))
        ret.push(displayContract('Play Bot', props.contractHandler.playBot))
      }
    }
    return ret
  }



  return <>{render()}</>
}

export default ContractInfoWidget

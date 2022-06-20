import {ContractHandlerType} from '../../type/contractType'
import AddressWidget from '../../component/addressWidget'

const ContractInfoWidget = (props : {
  contractHandler : ContractHandlerType
}) => {

  const displayContract = (contract : {
      contract ?: {
        address : string
      },
      versionOk ?: boolean
      name : string
    }) => {
    if (contract.contract)
      return (<div key={contract.contract.address}>
        {contract.name}:
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
    const animalDominance = displayContract(props.contractHandler.animalDominance)
    if (animalDominance){
      ret.push(animalDominance)
      const gameManager = displayContract(props.contractHandler.gameManager)
      if (gameManager){
        ret.push(gameManager)
        ret.push(displayContract(props.contractHandler.trading))
        ret.push(displayContract(props.contractHandler.nft))
        ret.push(displayContract(props.contractHandler.cardList))
        const gameList = displayContract(props.contractHandler.gameList)
        if (gameList){
          ret.push(gameList)
          ret.push(displayContract(props.contractHandler.playActionLib))
          ret.push(displayContract(props.contractHandler.playGameFactory))
          ret.push(displayContract(props.contractHandler.playBot))
        }

      }
    }
    return ret
  }



  return <>{render()}</>
}

export default ContractInfoWidget

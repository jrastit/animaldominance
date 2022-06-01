import Button from 'react-bootstrap/Button'

import {CardType} from '../../type/cardType'

const downloadFile = (data : string, fileName : string, fileType : string) => {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType })
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

const DownloadCardList = (props : {
  cardList : CardType[]
}) => {
  return (
    <Button onClick ={() => {
      downloadFile(
        JSON.stringify({card : props.cardList.map((card) => {
            return {
              name : card.name,
              mana : card.mana,
              family : card.family,
              starter : card.starter,
              level : card.level.map((level) =>
                { return  {
                    life : level.life,
                    attack : level.attack,
                    description : level.description,
                }}
              )
            }
        })}, null, 2),
        'card.json',
        'text/json'
      )
    }}>Download card list</Button>
  )
}

export default DownloadCardList

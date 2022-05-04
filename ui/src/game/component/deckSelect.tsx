import SelectWidget from '../../component/selectWidget'

import {
  UserDeckType
} from '../../type/userType'

const DeckSelect = (props : {
  userDeckList : UserDeckType[] | undefined
  setDeck : (deck : UserDeckType | undefined) => void
  deck : UserDeckType | undefined
}) => {

  const onChangeDeck = (event : {target : {name : string, value : string}}) => {
    if (props.userDeckList){
      props.setDeck(
        props.userDeckList.filter(
          (userDeck) => userDeck.id === parseInt(event.target.value)
        )[0]
      )
    }
  }

  let deckList = [{name:"", value:"-1"}] as {name: string, value:string}[]

  if (props.userDeckList){
    deckList = deckList.concat(
      props.userDeckList.concat([]).sort((deck1, deck2) => {
        return deck1.id - deck2.id
      }).map(userDeck => {
        return {
          name : "Deck " + userDeck.id,
          value : userDeck.id.toString()
        }
      })
    )
  }
  return (
    <SelectWidget
      onChange={onChangeDeck}
      option={deckList}
      value={props.deck ? props.deck.id.toString() : undefined}
    />
  )


}

export default DeckSelect

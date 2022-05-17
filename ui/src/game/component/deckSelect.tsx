import SelectWidget from '../../component/selectWidget'

import { useEffect } from 'react'

import {
  UserDeckType
} from '../../type/userType'

const _setDeck = (
  deckId : string,
  userDeckList : UserDeckType[] | undefined,
  setDeck : (deck : UserDeckType | undefined) => void
) => {
  if (userDeckList){
    setDeck(
      userDeckList.filter(
        (userDeck) => userDeck.id === parseInt(deckId)
      )[0]
    )
  }
}


const DeckSelect = (props : {
  userDeckList : UserDeckType[] | undefined
  setDeck : (deck : UserDeckType | undefined) => void
  deck : UserDeckType | undefined
  noEmpty ?: boolean
}) => {

  const onChangeDeck = (event : {target : {name : string, value : string}}) => {
    _setDeck(
      event.target.value,
      props.userDeckList,
      props.setDeck
    )
  }


  let deckList = (
    props.noEmpty ? [] : [{name:"", value:"-1"}]
  ) as {name: string, value:string}[]

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

  const defaultDeck = deckList[0]?.value

  useEffect(() => {
    if (props.noEmpty && !props.deck && defaultDeck){
      _setDeck(
        defaultDeck,
        props.userDeckList,
        props.setDeck
      )
    }
  }, [props.noEmpty, props.deck, defaultDeck, props.setDeck, props.userDeckList])

  return (
    <SelectWidget
      onChange={onChangeDeck}
      option={deckList}
      value={props.deck ? props.deck.id.toString() : undefined}
    />
  )


}

export default DeckSelect

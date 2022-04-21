import UserCardListWidget from '../game/component/userCardListWidget'

import { useState } from 'react'

import type {
  UserCardType,
} from '../type/userType'

import { useAppSelector } from '../hooks'

const DisplayUserCard = () => {
  const userCardList = useAppSelector((state) => state.userSlice.userCardList)

  const [userCardSubList, setUserCardSubList] = useState<UserCardType[]>([])

  const selectCard = (userCard : UserCardType) => {
    const length = userCardSubList.length
    const list = userCardSubList.filter(_userCard => _userCard.id != userCard.id)
    if (list.length === length){
      list.push(userCard)
    }
    setUserCardSubList(list)
  }

  if (userCardList) {
    return (
      <UserCardListWidget
        userCardList={userCardList}
        selectCard={selectCard}
        userCardSubList={userCardSubList}
      />
    )
  }

  return (<></>)
}

export default DisplayUserCard

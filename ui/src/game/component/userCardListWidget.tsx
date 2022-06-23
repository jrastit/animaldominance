import { BigNumber } from 'ethers'
import {
  getLevel
} from '../../game/card'

import type {
  UserCardType
} from '../../type/userType'

import UserCardWidget from './userCardWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import ButtonNice from '../../component/buttonNice'

const userCardListWidget = (props : {
  userCardList : Array<UserCardType>
  userCardSubList ?: Array<UserCardType>
  selectCard ?: (userCard : UserCardType) => void
  sellCard ?: (userCard : UserCardType) => void
  cancelSellCard ?: (userCard : UserCardType) => void
  nftCard ?: (userCard : UserCardType) => void
  nftBurnCard ?: (nftId : BigNumber) => void
}) => {

  const renderBottom = (userCard : UserCardType) => {
    if (props.sellCard && props.nftCard && props.cancelSellCard && userCard.exp > 10){
      if (!userCard.nftId.eq(0)){
        return (
          <div style={{
            textAlign : "center",
            backgroundColor : "#ffffffD0",
            borderRadius : "1em",
            color: "black",
          }}>nft id {userCard.nftId.toString()}</div>
        )
      }
      if (userCard.price === 0) {
        return (
          <>
            <ButtonNice onClick={() => { props.sellCard && props.sellCard(userCard) }}>
              Sell card
            </ButtonNice>&nbsp;
            <ButtonNice onClick={() => { props.nftCard && props.nftCard(userCard) }}>
              NFT card
            </ButtonNice>
          </>
        )
      } else {
        return (
          <ButtonNice onClick={() => { props.cancelSellCard && props.cancelSellCard(userCard) }}>
            Unlist card
          </ButtonNice>
        )
      }
    }
    else if (props.nftBurnCard){
      return (
        <ButtonNice onClick={() => { props.nftBurnCard && props.nftBurnCard(userCard.nftId) }}>
          Conver NFT to card
        </ButtonNice>
      )
    }
  }

  const displayUserCard = (userCard : UserCardType) => {
    let style={
      margin: ".5em 0em",
      backgroundColor : "#00000000",
      borderRadius : "1em",
    } as any
    let style2={
      textAlign : "center",
      backgroundColor : "#ffffffD0",
      borderRadius : "1em",
      color: "black",
    } as any
    if (props.userCardSubList){
      if (props.userCardSubList.filter(
        _userCard => _userCard.id === userCard.id).length
      ){
        style={
          margin: "0em -.5em",
          padding: "0.5em 0.5em",
          backgroundColor : "#000000D0",
          borderRadius : "1em",
        }
        style2={
          textAlign : "center",
          color : "white",
          backgroundColor : "#000000D0",
          borderRadius : "1em",
        }
      }
    }
    const level = getLevel(userCard.exp)
    const bottom = renderBottom(userCard)
    return (
      <Col xs={12} sm={6} md={4} lg={3} xxl={2} key={userCard.id}  onClick={() => {
        props.selectCard && props.selectCard(userCard)
      }}>
      <div style={{
        padding: "0.2em 0.5em",
        marginTop: '1em',
      }}>
      <div style={style2}> Level {level + 1}</div>
      <div style={style}>
        <UserCardWidget
          userCard={userCard}
        />
      </div>
      </div>

      { !!bottom &&
        <div style={{
          textAlign : "center",
          marginBottom : "1em",
        }}>
          {bottom}
        </div>
       }
      </Col>
    )
  }

  return (
    <Container fluid>
        <Row>
          {props.userCardList.filter(userCard => !userCard.sold).map(displayUserCard)}
        </Row>
    </Container>

  )
}

export default userCardListWidget



import type {
  UserCardType
} from '../../type/userType'

import UserCardWidget from './userCardWidget'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

const userCardListWidget = (props : {
  userCardList : Array<UserCardType>
  userCardSubList ?: Array<UserCardType>
  selectCard ?: (userCard : UserCardType) => void
}) => {

  const displayUserCard = (userCard : UserCardType, id: number) => {
    let style={
      padding: "0.5em 0.5em",
    } as any
    if (props.userCardSubList){
      if (props.userCardSubList.filter(
        _userCard => _userCard.id === userCard.id).length
      ){
        style={
          backgroundColor : "#FFFFFF80",
          borderRadius : "1em",
          padding: "0.5em 0.5em",
        }
      }
    }
    return (
      <Col xs={2} key={id}  onClick={() => {
        props.selectCard && props.selectCard(userCard)
      }}>
      <div style={style}>
        <UserCardWidget
          userCard={userCard}
        />
      </div>
      </Col>
    )
  }

  return (
    <Container fluid>
        <Row>
          {props.userCardList.map(displayUserCard)}
        </Row>
    </Container>

  )
}

export default userCardListWidget

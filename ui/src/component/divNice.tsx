import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import SpaceWidget from '../component/spaceWidget'

const DivNice = (props:{
  children ?: any
  style ?: any
}) => {
  return <Row className="justify-content-center" style={{marginTop : '2em'}}>
  <Col md='6' lg='3' style={{
    backgroundColor : '#000000D0',
    color: 'white',
    borderRadius: '1em',
  }}>
  <SpaceWidget>
  <div style={{textAlign :'center'}}>
  <div style={props.style}>
  {props.children}
  </div>
  </div>
  </SpaceWidget>
  </Col>
  </Row>
}

export default DivNice

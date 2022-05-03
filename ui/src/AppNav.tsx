import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
//import NavDropdown from 'react-bootstrap/NavDropdown';
//import Form from 'react-bootstrap/Form';
//import FormControl from 'react-bootstrap/FormControl';
//import Button from 'react-bootstrap/Button';

import WalletWidget from './component/walletWidget'
import UserWidget from './game/component/userWidget'

import { useAppSelector } from './hooks'

const AppNav = (props: {
  setIsHome: (number: number) => void,
  address?: string,
  error: string | undefined,
  networkName: string | undefined,
  section: string | undefined,
  setSection: (section : string) => void,
}) => {

  const user = useAppSelector((state) => state.userSlice.user)

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand onClick={() => props.setIsHome(1)}>EWallet{props.networkName && <> on {props.networkName}</>}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link onClick={() => props.setIsHome(1)}>Wallet</Nav.Link>
          <Nav.Link onClick={() => props.setSection('game')}>Game</Nav.Link>
          <Nav.Link onClick={() => props.setSection('userCard')}>My cards</Nav.Link>
          <Nav.Link onClick={() => props.setSection('card')}>All cards</Nav.Link>
          {/*
          <Nav.Link href="#link">Link</Nav.Link>
          <NavDropdown title="Dropdown" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
          </NavDropdown>
          */false}
        </Nav>
        <Nav className="mr-auto">
          {/*
        <Form inline>
          <FormControl type="text" placeholder="Search" className="mr-sm-2" />
          <Button variant="outline-success">Search</Button>
        </Form>
        */false}
        </Nav>
      </Navbar.Collapse>
      <Navbar.Brand>
        <UserWidget user={user}/>
        <WalletWidget address={props.address} error={props.error} />
      </Navbar.Brand>
      <Navbar.Brand>
      </Navbar.Brand>

    </Navbar>
  )
}

export default AppNav

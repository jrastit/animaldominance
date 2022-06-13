import { useState } from 'react'
import encUTF8 from 'crypto-js/enc-utf8';
import CryptoJS from 'crypto-js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { useAppSelector, useAppDispatch } from '../../hooks'

import {
  walletStorageUpdatePassword
} from '../../util/walletStorage'

import {
  updateStep,
  Step,
  StepId,
} from '../../reducer/contractSlice'

import {
  setPassword,
} from '../../reducer/walletSlice'

const WalletPassword = () => {

  const password = useAppSelector((state) => state.walletSlice.password)
  const dispatch = useAppDispatch()

  const [password1, setPassword1] = useState<string>()
  const [password2, setPassword2] = useState<string>()
  const [remember, setRemember] = useState<boolean>(false)

  const _newPassword = (_password : string) => {
    const newPassword = CryptoJS.SHA256("2fysF8Tx" + _password).toString(CryptoJS.enc.Base64)
    const passwordCheck = CryptoJS.AES.encrypt("2fysF8Tx", newPassword).toString()
    if (CryptoJS.AES.decrypt(passwordCheck, newPassword).toString(encUTF8) === "2fysF8Tx"){
      if (remember){
        walletStorageUpdatePassword(newPassword, passwordCheck)
      } else {
        walletStorageUpdatePassword(undefined, passwordCheck)
        dispatch(setPassword(newPassword))
      }
      dispatch(updateStep({id : StepId.Wallet, step : Step.Init}))
    } else {
      console.error("Error creating password")
    }
  }

  const _unlockPassword = (event : any) => {
    const _password = event.target.value
    if (_password){
      if (password.passwordCheck){
        const unlockPassword = CryptoJS.SHA256("2fysF8Tx" + _password).toString(CryptoJS.enc.Base64)
        try {
          if (CryptoJS.AES.decrypt(password.passwordCheck, unlockPassword).toString(encUTF8) === "2fysF8Tx"){
            if (remember){
              walletStorageUpdatePassword(unlockPassword, password.passwordCheck)
            } else {
              dispatch(setPassword(unlockPassword))
            }
            dispatch(updateStep({id : StepId.Wallet, step : Step.Init}))
          }
        } catch (error) {

        }

      }
    }
  }

  return (
    <>
      { (!!password.passwordCheck) &&
        <>
          <p style={{fontWeight:'bold'}}>Unlock your local wallet</p>
          <Form.Check
          checked={remember}
          type="checkbox"
          label="Remember it"
          name="remeber"
          onChange={(_event) => {setRemember(!remember)}}
          />
          <Form.Control type="password" placeholder="Password" name="password" onChange={_unlockPassword}/>
        </>

      }
      { (!password.passwordCheck) &&
        <>
          <p style={{fontWeight:'bold'}}>Setup your password</p>
          <p>Enter Password : <input type="password" name="password1" onChange={event => {setPassword1(event.target.value)}}></input></p>
          { !!password1 &&
            <>
            <p>ReEnter Password : <input type="password" name="password2" onChange={event => {setPassword2(event.target.value)}}></input></p>
            { (password1 === password2) &&
              <Button onClick={() => {!!password1 && _newPassword(password1)}}>Set password</Button>
            }
            </>
          }
        </>
      }
    </>
  )


}

export default WalletPassword

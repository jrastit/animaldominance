import Button from 'react-bootstrap/Button'
import BoxWidget from '../component/boxWidget'
import SpaceWidget from '../component/spaceWidget'
import WalletDeleteAll from '../component/wallet/walletDeleteAll'
import NetworkInfoWidget from '../component/wallet/networkInfoWidget'
import WalletInfoWidget from '../component/wallet/walletInfoWidget'
import NetworkSelectWidget from '../component/wallet/networkSelectWidget'
import NetworkSwitchWidget from '../component/wallet/networkSwitchWidget'
import WalletSelectWidget from '../component/wallet/walletSelectWidget'
import CardWidget from '../game/component/cardWidget'
import { TransactionManager } from '../util/TransactionManager'
import DivNice from '../component/divNice'

import WalletPassword from '../component/wallet/walletPassword'
import StepMessageNiceWidget from '../component/stepMessageNiceWidget'
import {
  walletStorageSetType,
  walletStorageClearPassword,
} from '../util/walletStorage'


import {
  Step,
  StepId,
  isStep,
  updateStep,
  getStep,
  clearError,
} from '../reducer/contractSlice'

import {
  clearPassword
} from '../reducer/walletSlice'

import { useAppSelector, useAppDispatch } from '../hooks'

const WalletConnection = (props: {
  transactionManager: TransactionManager | undefined
  setSection: (section: string) => void
}) => {

  const dispatch = useAppDispatch()

  const step = useAppSelector((state) => state.contractSlice.step)

  const wallet = useAppSelector((state) => state.walletSlice.wallet)
  const network = useAppSelector((state) => state.walletSlice.network)
  const password = useAppSelector((state) => state.walletSlice.password)

  const setWalletType = (type?: string) => {
    walletStorageSetType(type)
    dispatch(updateStep({ id: StepId.Wallet, step: Step.Init }))
  }

  const renderDisconnect = () => {
    return (
      <SpaceWidget>
        <Button variant="warning" onClick={() => {
          walletStorageClearPassword()
          dispatch(clearPassword())
          dispatch(updateStep({ id: StepId.Wallet, step: Step.Init }))
        }}>Disconnect</Button>
      </SpaceWidget>
    )
  }

  const renderHome = () => {
    return (
      <SpaceWidget>
        <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
      </SpaceWidget>
    )
  }

  const render = () => {

    if (isStep(StepId.Wallet, Step.Loading, step)) {
      return (
        <>
          <SpaceWidget>
          </SpaceWidget>
          <DivNice>
            <p>Loading wallet ...</p>
          </DivNice>
        </>
      )
    }
    if (isStep(StepId.Wallet, Step.NotSet, step)) {
      return (
        <>
          <SpaceWidget>
          </SpaceWidget>
          <div style={{ fontSize: '12px' }}>
            <CardWidget
              family={1}
              name={'Kitten'}
              mana={1}
              level={0}
              attack={10}
              life={10}
              description={'Ready to fight!'}
              exp={0}
            />
          </div>
          <DivNice>
            <h3>Annimal Dominance</h3>
            <p>A blockchain card game!</p>
            <p>Chose your wallet to connect and start playing.</p>
          </DivNice>
          <SpaceWidget>
            <BoxWidget title='Metamask'>
              <p>Use wallet and network configured within Metamask</p>
              <p><a href='https://metamask.io/'>get Metamask here</a></p>
              <SpaceWidget>
                <Button onClick={() => setWalletType('Metamask')}>
                  Enter with Metamask
                </Button>
              </SpaceWidget>
            </BoxWidget>
          </SpaceWidget>
          <SpaceWidget>
            <SpaceWidget>
              <BoxWidget title='Broswer'>
                <p>Use your internet broswer cache to keep your wallet</p>
                <Button onClick={() => setWalletType('Broswer')}>
                  Enter with broswer wallet
                </Button>
                {!!password.passwordCheck &&
                  <WalletDeleteAll />
                }
              </BoxWidget>
            </SpaceWidget>
          </SpaceWidget>
        </>
      )
    }
    switch (wallet.type) {
      case 'Broswer':
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <p>
              <SpaceWidget>
                <WalletSelectWidget
                  setSection={props.setSection}
                />
              </SpaceWidget>
              {renderDisconnect()}
              {renderHome()}
            </p>
          )
        }
        if (isStep(StepId.Wallet, Step.NoPassword, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Broswer'>
                <p>Use your internet broswer cache to keep your wallet</p>
                <SpaceWidget>
                  <WalletPassword />
                </SpaceWidget>
                {renderHome()}
              </BoxWidget>
            </SpaceWidget>
          )
        }
        if (isStep(StepId.Wallet, Step.Ok, step)) {
          return (
            <>
            <SpaceWidget>
              <BoxWidget title="Select network">
                <NetworkSelectWidget />
              </BoxWidget>
            </SpaceWidget>
              <SpaceWidget>
                <WalletSelectWidget
                  setSection={props.setSection}
                />
              </SpaceWidget>
              <SpaceWidget>
                <BoxWidget>
                  {renderDisconnect()}
                  <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
                </BoxWidget>
              </SpaceWidget>
            </>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask Error'>
                <p>Is your metamask connected?</p>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect metamask</Button>

                <StepMessageNiceWidget
                  title='Wallet'
                  step={getStep(StepId.Wallet, step)}
                  resetStep={() => { dispatch(clearError(StepId.Wallet)) }}
                /
                >

              </BoxWidget>
            </SpaceWidget>
          )
        }
        return (
          <BoxWidget title='Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
          </BoxWidget>
        )
      case 'Metamask':
        if (isStep(StepId.Wallet, Step.NoAddress, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask'>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect wallet</Button>
                <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
              </BoxWidget>
            </SpaceWidget>
          )
        }
        if (isStep(StepId.Wallet, Step.Ok, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask'>
              <NetworkSwitchWidget/>
              { network &&
                <NetworkInfoWidget
                  network={network}
                />
              }
              { wallet &&
                <WalletInfoWidget
                  wallet={wallet}
                  network={network}
                />
              }
                <Button onClick={() => props.setSection('game')}>Ok</Button>
              </BoxWidget>
              <BoxWidget>
                <Button variant="warning" onClick={() => setWalletType()}>Home</Button>
              </BoxWidget>
            </SpaceWidget>
          )
        }
        if (isStep(StepId.Wallet, Step.Error, step)) {
          return (
            <SpaceWidget>
              <BoxWidget title='Metamask Error'>
                <p>Is your metamask connected?</p>
                <Button size='sm' variant="warning" onClick={() => {
                  window.ethereum.enable().then()
                }}>Connect metamask</Button>

                <StepMessageNiceWidget
                  title='Wallet'
                  step={getStep(StepId.Wallet, step)}
                  resetStep={() => { dispatch(clearError(StepId.Wallet)) }}
                /
                >

              </BoxWidget>
            </SpaceWidget>
          )
        }
        return (
          <BoxWidget title='Metamask Error wallet step'>
            {'Unknow step ' + Step[getStep(StepId.Wallet, step).step]}
          </BoxWidget>
        )
      default:
        return (
          <SpaceWidget>
            <BoxWidget title='Error wallet type'>
              <p>Unkonw type : {wallet.type}</p>
            </BoxWidget>
          </SpaceWidget>
        )
    }
  }
  return render()
}

export default WalletConnection

import { useState } from 'react';

import './App.css';
import AppNav from './AppNav'

import Container from 'react-bootstrap/Container';

import { TransactionManager } from './util/TransactionManager'
import WalletConnection from './section/walletConnection'
import AdminSection from './section/adminSection'
import WalletLoader from './loader/walletLoader'

import 'bootstrap/dist/css/bootstrap.min.css';

import { useAppSelector } from './hooks'

import {
  StepId,
  isOk,
} from './reducer/contractSlice'

function App() {

  const [section, setSection] = useState<string | undefined>()
  const [transactionManager, setTransactionManager] = useState<TransactionManager>()

  const step = useAppSelector((state) => state.contractSlice.step)

  const isWallet = (section === 'wallet' || !isOk(StepId.Wallet, step))

  return (
    <div className="App">
      <Container fluid>
        <WalletLoader
          transactionManager={transactionManager}
          setTransactionManager={setTransactionManager}
        />
        {!isWallet && <AppNav
          section={section}
          setSection={setSection}
        />}
        { !!isWallet &&
          <WalletConnection
            transactionManager={transactionManager}
            setSection={setSection}
          />
        }

        { !isWallet && transactionManager && (
          <AdminSection
            section={section}
            transactionManager={transactionManager}
          />
        )}

      </Container>

    </div>
  );
}

export default App;

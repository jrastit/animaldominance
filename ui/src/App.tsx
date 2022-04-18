import { useState } from 'react';

import './App.css';
import AppNav from './AppNav'

import { WalletInfo } from './type/walletInfo'

import Container from 'react-bootstrap/Container';

import WalletConnection from './section/walletConnection'
import AdminSection from './section/adminSection'

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isHome, setIsHome] = useState(1);

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({})

  const [password, setPassword] = useState<string | null>()

  return (
    <div className="App">
      <Container fluid>
        {!isHome && <AppNav
          setIsHome={setIsHome}
          networkName={walletInfo.networkName}
          address={walletInfo.address}
          error={walletInfo.error}
        />}
        { (!!isHome) &&
          <WalletConnection
            password={password}
            setPassword={setPassword}
            walletInfo={walletInfo}
            setWalletInfo={setWalletInfo}
            setIsHome={setIsHome}
          />
        }


        { !isHome && !!walletInfo.transactionManager && !!walletInfo.networkName && !!walletInfo.address && (
          <AdminSection
            transactionManager={walletInfo.transactionManager}
            networkName={walletInfo.networkName}
          />
        )}

      </Container>

    </div>
  );
}

export default App;

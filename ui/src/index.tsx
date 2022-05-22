import { Provider } from "react-redux";
import ReactDOM from 'react-dom';
import { store } from "./store";
import './index.css';
import App from './App';
import * as serviceWorker from "./serviceWorker";
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from "@ethersproject/providers";

function getLibrary(provider : any) {
  return new Web3Provider(provider);
}

ReactDOM.render(
  <Provider store={store}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>,
  </Provider>,
  document.getElementById('root')
)


// If you want your app to work offline and load faster, you can chađinge
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

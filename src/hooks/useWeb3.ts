import { getAddress } from 'ethers/lib/utils';
import { useContext } from 'react'
import Web3 from 'web3';
import { INCORRECT_NETWORK } from '../assets/constants/parameters';

import { store } from '../state';
import { clearCachedWeb3, getWeb3 } from '../utils/getWeb3';

export interface Web3Hook {
  handleSetWeb3: (web3: Web3) => Promise<boolean>;
  connectWeb3: () => Promise<boolean>;
  disconnectWeb3: () => void;
  provider: Web3;
  account?: string;
  loggedIn: boolean;
}

export function useWeb3(): Web3Hook {
  const { state, dispatch } = useContext(store);

  async function handleSetWeb3(web3: Web3): Promise<boolean> {
    const accounts = await web3.eth.getAccounts();
    const account = getAddress(accounts[0]);
    const network = await web3.eth.net.getId();

    const expectedID = process.env.REACT_APP_ETH_NETWORK === 'mainnet' ? 1 : 4
    if((+network) !== expectedID){
      dispatch({ type: 'MODAL', payload: INCORRECT_NETWORK });
      return false;
    }
    dispatch({ type: 'WEB3', payload: { web3, account, network } });
    return true;
  }

  function disconnectWeb3() {
    clearCachedWeb3();
    dispatch({
      type: 'WEB3',
      payload: {
        helper: state.helper,
        web3: false,
        account: null,
        network: 0,
      }
    })
  }

  async function connectWeb3(): Promise<boolean> {
    const web3 = await getWeb3();
    if (!web3) {
      return false
    }
    return handleSetWeb3(web3);
  }

  return {
    handleSetWeb3,
    connectWeb3,
    disconnectWeb3,
    provider: state.web3.injected || state.web3[process.env.REACT_APP_ETH_NETWORK],
    account: state.account || null,
    loggedIn: !!(state.web3.injected)
  };
}
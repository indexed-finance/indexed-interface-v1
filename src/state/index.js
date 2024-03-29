import React, { createContext, useReducer } from 'react';

import { initialState, TX_CONFIRMED, TX_PENDING, TX_REVERTED } from '../assets/constants/parameters'
import { isNative } from '../assets/constants/functions'

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case 'RESIZE':
        return { ...state, ...action.payload, native: isNative({ ...action.payload })  }
      case 'BALANCE':
          return {
              ...state, balances: {
              ...state.balances, ...action.payload.balances
            }
          }
      case 'LOAD':
        return { ...state, load: action.payload }
      case 'MODAL':
        return { ...state, modal: action.payload }
      case 'DISMISS':
        return { ...state, modal: initialState.modal }
      case 'CLOSE':
        return { ...state, flag: initialState.flag }
      case 'FLAG':
        return { ...state, flag: action.payload }
      case 'GENERIC':
        return { ...state, ...action.payload }
      case 'WEB3':
        if (action.payload.account && (action.payload.helper || state.helper)) {
          let account = action.payload.account;
          let helper = action.payload.helper || state.helper;
          let allPools = [...helper.initialized, ...helper.uninitialized];
          for (let pool of allPools) {
            if (!pool.userAddress) {
              pool.setUserAddress(account);
            }
          }
        }
        return {
          ...state, web3: {
            ...state.web3, injected: action.payload.web3
          },
          account: action.payload.account,
          network: action.payload.network,
          helper: action.payload.helper
        }
      default:
        return state
    };
  }, initialState)

  function handleTransaction(txPromise) {
    return new Promise((resolve, reject) => {
      txPromise
      .on('transactionHash', (transactionHash) => {
        dispatch(TX_PENDING(transactionHash));
      })
      .on('confirmation', async (conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash));
            resolve();
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash));
            reject();
          }
        }
      })
    });
  }

  return <Provider value={{ state, dispatch, handleTransaction }}>{children}</Provider>
}

export { store, StateProvider }

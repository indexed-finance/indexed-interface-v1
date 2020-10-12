import React, { createContext, useReducer } from 'react';

import { initialState } from '../assets/constants/parameters'
import { isNative } from '../assets/constants/functions'
import { getBalances } from '../lib/markets'

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case 'RESIZE':
        return { ...state, native: isNative({ ...action.payload })  }
      case 'BALANCE':
          let { account, web3 } = state
          let { assets } = action.payload
          let balances =  getBalances(web3.rinkeby, account, assets, {})

          return {
              ...state, balances: {
              ...state.balances, ...balances
            }
          }
      case 'LOAD':
        return { ...state, load: action.payload }
      case 'GENERIC':
        return { ...state, ...action.payload }
      case 'WEB3':
        return {
          ...state, web3: {
            ...state.web3, injected: action.payload.web3
          },
          account: action.payload.account,
          network: action.payload.network
        }
      default:
        return state
    };
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }

import React, { createContext, useReducer } from 'react';

import { initialState } from '../assets/constants/parameters'
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

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }

import React, { createContext, useReducer } from 'react';

import { initialState } from '../assets/constants/parameters'

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( { children } ) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch(action.type) {
      case 'INIT':
        return { ...state, ...action.payload }
      case 'BAL':
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

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider }

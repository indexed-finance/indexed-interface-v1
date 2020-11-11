import React, { createContext, useContext } from 'react';
import { InitContextType, InitializerState, useInit } from './reducers/initializer-reducer';

const InitializerStateContext = createContext(undefined);

export const InitializerStateProvider = ({ children }) => {
  /* {
    useToken,
    setPoolAmount,
    mintState,
    setHelper,
  } */
  const stateHooks = useInit();
  return (
    <InitializerStateContext.Provider value={stateHooks}>
      {children}
    </InitializerStateContext.Provider>
  );
}

export const useInitializerState = (): InitContextType => {
  return useContext(InitializerStateContext);
};

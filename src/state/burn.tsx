import React, { createContext, useContext } from 'react';
import { BurnContextType, useBurn } from './reducers/burn-reducer';

const BurnStateContext = createContext(undefined);

export const BurnStateProvider = ({ children }) => {
  const stateHooks = useBurn();
  return (
    <BurnStateContext.Provider value={stateHooks}>
      {children}
    </BurnStateContext.Provider>
  );
}

export const useBurnState = (): BurnContextType => {
  return useContext(BurnStateContext);
};
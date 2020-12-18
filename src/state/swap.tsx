import React, { createContext, useContext } from 'react';
import { SwapContextType, useSwap } from './reducers/swap-reducer';

const SwapeStateContext = createContext(undefined);

export const SwapStateProvider = ({ children }) => {
  /* {
    useToken,
    setPoolAmount,
    mintState,
    setHelper,
  } */
  const stateHooks = useSwap();
  return (
    <SwapeStateContext.Provider value={stateHooks}>
      {children}
    </SwapeStateContext.Provider>
  );
}

export const useSwapState = (): SwapContextType => {
  return useContext(SwapeStateContext);
};

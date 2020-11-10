import React, { createContext, useContext } from 'react';
import { MintContextType, MintState, useMint } from './reducers/mint-reducer';

const MintStateContext = createContext(undefined);

export const MintStateProvider = ({ children }) => {
  /* {
    useToken,
    setPoolAmount,
    mintState,
    setHelper,
  } */
  const stateHooks = useMint();
  return (
    <MintStateContext.Provider value={stateHooks}>
      {children}
    </MintStateContext.Provider>
  );
}

export const useMintState = (): MintContextType => {
  return useContext(MintStateContext);
};
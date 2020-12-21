import React, { createContext, useContext } from 'react';
import { MintContextType, useMint } from './reducers/mint-reducer';
import { UniswapMinterContextType, useUniswapMinter } from './reducers/uniswap-minter-reducer';

const MintStateContext = createContext(undefined);

export const MintStateProvider = ({ children }) => {
  /* {
    useToken,
    setPoolAmount,
    mintState,
    setHelper,
  } */
  const mintHooks = useMint();
  const uniswapMinterHooks = useUniswapMinter();
  const stateHooks = {
    ...mintHooks,
    uniswapMinter: uniswapMinterHooks
  }
  return (
    <MintStateContext.Provider value={stateHooks}>
      {children}
    </MintStateContext.Provider>
  );
}

export const useMintState = (): MintContextType & { uniswapMinter: UniswapMinterContextType }=> {
  return useContext(MintStateContext);
};

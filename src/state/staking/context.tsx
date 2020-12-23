import React, { createContext, useContext } from 'react';
import { useStaking, StakingContextType } from './hooks';

const StakingStateContext = createContext(undefined);

export function StakingContextProvider({ children }) {
  const stateHooks = useStaking();
  return <StakingStateContext.Provider value={stateHooks}>
    {children}
  </StakingStateContext.Provider>
}

export const useStakingState = (): StakingContextType => {
  return useContext(StakingStateContext);
};

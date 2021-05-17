import React, { createContext, useContext } from 'react';
import { useNewStaking, NewStakingContextType } from './hooks';

const NewStakingStateContext = createContext(undefined);

export function NewStakingContextProvider({ children }) {
  const stateHooks = useNewStaking();
  return <NewStakingStateContext.Provider value={stateHooks}>
    {children}
  </NewStakingStateContext.Provider>
}

export const useNewStakingState = (): NewStakingContextType => {
  return useContext(NewStakingStateContext);
};

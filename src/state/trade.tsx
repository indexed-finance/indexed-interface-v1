import React, { createContext, useContext } from 'react';
import { TradeContextType, useTrade } from './reducers/trade-reducer';

const TradeStateContext = createContext(undefined);

export const TradeStateProvider = ({ children }) => {
  const stateHooks = useTrade();
  return (
    <TradeStateContext.Provider value={stateHooks}>
      {children}
    </TradeStateContext.Provider>
  );
}

export const useTradeState = (): TradeContextType => {
  return useContext(TradeStateContext);
};
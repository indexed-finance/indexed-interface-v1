import { BigNumber } from "@indexed-finance/indexed.js";
import { InitializerHelper } from "@indexed-finance/indexed.js/dist/initializer-helper"
import { InitializerToken } from "@indexed-finance/indexed.js/dist/types";

export type SetHelper = { type: 'SET_POOL_HELPER', pool: InitializerHelper };
export type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };
export type SetTokenAmount = {
  type: 'SET_TOKEN_AMOUNT',
  amount: BigNumber,
  displayAmount: string,
  credit: BigNumber,
  index: number
};
export type SetAll = {
  type: 'SET_ALL',
  tokens: InitializerToken[],
  amounts: BigNumber[],
  displayAmounts: string[],
  credits: BigNumber[],
  currentValue: BigNumber,
  finalValueEstimate: BigNumber
};

export type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
export type SetTokenInput = { type: 'SET_TOKEN_INPUT', index: number, amount: string | number };
export type UpdatePool = { type: 'UPDATE_POOL', clearInputs?: boolean };

export type InitDispatchAction = ToggleToken | SetHelper | SetTokenAmount | SetAll;
export type InitDispatch = (actions: InitDispatchAction | InitDispatchAction[]) => void;
export type MiddlewareAction =  SetTokenInput | SetTokenExact | UpdatePool;
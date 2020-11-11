import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";

export type SetHelper = { type: 'SET_POOL_HELPER', pool: PoolHelper };
export type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };

export type SetPoolAmount = { type: 'SET_POOL_AMOUNT', amount: BigNumber, displayAmount: string };
export type SetPoolOutput = { type: 'SET_POOL_OUTPUT', amount: string | number };

export type SetSingleAmount = {
  type: 'SET_SINGLE_AMOUNT',
  index: number,
  amount: BigNumber,
  displayAmount: string,
  allowance: BigNumber,
  balance: BigNumber
};
export type SetAllAmount = { type: 'SET_ALL_AMOUNTS', amounts: BigNumber[], allowances: BigNumber[], balances: BigNumber[], displayAmounts: string[] };
export type ClearAllAmounts = { type: 'CLEAR_ALL_AMOUNTS' }
export type SetSpecifiedSide = { type: 'SET_SPECIFIED_SIDE', side: 'input' | 'output' };

export type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
export type SetTokenInput = { type: 'SET_TOKEN_INPUT', index: number, amount: string | number };

export type UpdatePool = { type: 'UPDATE_POOL' };

export type MintDispatchAction = ClearAllAmounts | ToggleToken | SetPoolAmount | SetPoolOutput | SetSingleAmount | SetAllAmount | SetHelper | SetSpecifiedSide;
export type MintDispatch = (actions: MintDispatchAction | MintDispatchAction[]) => void;

export type MiddlewareAction = SetTokenInput | SetTokenExact | SetPoolAmount | SetPoolOutput | UpdatePool;
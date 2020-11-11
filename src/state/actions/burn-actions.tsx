import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";

export type SetHelper = { type: 'SET_POOL_HELPER', pool: PoolHelper };
export type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };
export type SetPoolAmount = { type: 'SET_POOL_AMOUNT', amount: BigNumber };
export type SetSingleAmount = { type: 'SET_SINGLE_AMOUNT', index: number, amount: BigNumber, allowance: BigNumber, balance: BigNumber };
export type SetAllAmount = { type: 'SET_ALL_AMOUNTS', amounts: BigNumber[], allowances: BigNumber[], balances: BigNumber[] };
export type SetSpecifiedSide = { type: 'SET_SPECIFIED_SIDE', side: 'input' | 'output' };
export type SetUserPoolBalance = { type: 'SET_USER_POOL_BALANCE', balance: BigNumber };

export type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
export type SetTokenOutput = { type: 'SET_TOKEN_OUTPUT', index: number, amount: string | number };
export type SetPoolInput = { type: 'SET_POOL_INPUT', amount: string | number };
export type SetPoolExact = { type: 'SET_POOL_EXACT', amount: BigNumber };
export type UpdatePool = { type: 'UPDATE_POOL' };

export type BurnDispatchAction = ToggleToken | SetPoolAmount | SetSingleAmount | SetAllAmount | SetHelper | SetSpecifiedSide | SetUserPoolBalance;
export type BurnDispatch = (actions: BurnDispatchAction | BurnDispatchAction[]) => void;
export type MiddlewareAction = SetTokenOutput | SetPoolInput | SetTokenExact | UpdatePool | SetPoolExact;
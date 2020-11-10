import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";
import { MintState } from "../reducers/mint-reducer";

export type SetHelper = { type: 'SET_POOL_HELPER', pool: PoolHelper };
export type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };
export type SetPoolAmount = { type: 'SET_POOL_AMOUNT', amount: BigNumber };
export type SetSingleAmount = { type: 'SET_SINGLE_AMOUNT', index: number, amount: BigNumber, allowance: BigNumber, balance: BigNumber };
export type SetAllAmount = { type: 'SET_ALL_AMOUNTS', amounts: BigNumber[], allowances: BigNumber[], balances: BigNumber[] };

export type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
export type SetTokenInput = { type: 'SET_TOKEN_INPUT', index: number, amount: string | number };
export type SetPoolOutput = { type: 'SET_POOL_OUTPUT', amount: string | number };

export type MintDispatchAction = ToggleToken | SetPoolAmount | SetSingleAmount | SetAllAmount | SetHelper;
export type MintDispatch = (actions: MintDispatchAction | MintDispatchAction[]) => void;
export type MiddlewareAction = SetTokenInput | SetPoolOutput | SetTokenExact;
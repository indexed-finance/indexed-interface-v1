import { BigNumber } from "@indexed-finance/indexed.js";
import { InitializerState } from "../reducers/initializer-reducer";
import { InitializerHelper } from "@indexed-finance/indexed.js/dist/initializer-helper"

export type SetHelper = { type: 'SET_POOL_HELPER', pool: InitializerHelper };
export type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };
export type SetSingleAmount = { type: 'SET_SINGLE_AMOUNT', index: number, amount: BigNumber, allowance: BigNumber, balance: BigNumber };
export type SetAllAmount = { type: 'SET_ALL_AMOUNTS', amounts: BigNumber[], allowances: BigNumber[], balances: BigNumber[] };
export type SetPoolOutput = { type: 'SET_POOL_OUTPUT', amount: BigNumber, display: string };

export type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
export type SetTokenInput = { type: 'SET_TOKEN_INPUT', index: number, amount: string | number };

export type InitDispatchAction = ToggleToken | SetPoolOutput | SetSingleAmount | SetAllAmount | SetHelper;
export type InitDispatch = (actions: InitDispatchAction | InitDispatchAction[]) => void;
export type MiddlewareAction =  SetTokenInput | SetTokenExact;
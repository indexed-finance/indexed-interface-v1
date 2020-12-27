import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";
import { SwapToken, TokenList } from "../reducers/swap-reducer";

// Reducer only
export type SetInputToken = { type: 'SET_INPUT_TOKEN', token: SwapToken };
export type SetOutputToken = { type: 'SET_OUTPUT_TOKEN', token: SwapToken };
export type SetHelper = { type: 'SET_HELPER', pool: PoolHelper };
export type SetTokens = { type: 'SET_TOKENS', tokens: TokenList };
export type SetOutputs = { type: 'SET_OUTPUTS', tokens: TokenList };
export type SetPrice = { type: 'SET_PRICE', price: BigNumber };
export type SetSlippage = { type: 'SET_SLIPPAGE', slippage: number };
export type SetSpecifiedSide = { type: 'SET_SPECIFIED_SIDE', side: 'input' | 'output' };
export type SetMaxPrice = { type: 'SET_MAX_PRICE', price: BigNumber };

// Middleware only
export type UpdateBalances = { type: 'UPDATE_POOL', clearInputs?: boolean };
export type SwitchTokens = { type: 'SWITCH_TOKENS' };
export type SetInputAmount = { type: 'SET_INPUT_AMOUNT', amount: string };
export type SetInputExact = { type: 'SET_INPUT_EXACT', amount: BigNumber };
export type SetOutputAmount = { type: 'SET_OUTPUT_AMOUNT', amount: string };
export type SelectToken = { type: 'SELECT_TOKEN', index: number };
export type SelectOutput = { type: 'SELECT_OUTPUT', index: number };

export type SwapDispatchAction = SetSlippage | SetSpecifiedSide | SetInputToken | SetTokens | SetOutputs | SelectOutput | SetOutputToken | SetHelper | SetPrice | SetMaxPrice;
export type SwapMiddlewareAction = UpdateBalances | SwitchTokens | SetOutputs | SetInputAmount | SetTokens | SetOutputAmount | SetHelper | SetInputExact | SelectToken;
export type SwapDispatch = (actions: SwapDispatchAction | SwapDispatchAction[]) => void;

import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";
import { SwapToken, TokenList } from "../reducers/swap-reducer";

// Reducer only
export type SetInputToken = { type: 'SET_INPUT_TOKEN', token: SwapToken };
export type SetOutputToken = { type: 'SET_OUTPUT_TOKEN', token: SwapToken };
export type setHelper = { type: 'SET_HELPER', helper: PoolHelper };
export type SetTokens = { type: 'SET_TOKENS', tokens: TokenList };
export type SetPrice = { type: 'SET_PRICE', price: string };

// Middleware only
export type UpdateBalances = { type: 'UPDATE_POOL', clearInputs?: boolean };
export type SwitchTokens = { type: 'SWITCH_TOKENS' };
export type SetInputAmount = { type: 'SET_INPUT_AMOUNT', amount: string };
export type SetInputExact = { type: 'SET_INPUT_EXACT', amount: BigNumber };
export type SetOutputAmount = { type: 'SET_OUTPUT_AMOUNT', amount: string };
export type SelectToken = { type: 'SELECT_TOKEN', index: number };

export type SwapDispatchAction = SetInputToken | SetOutputToken | SetHelper | SetPrice;
export type SwapMiddlewareAction = UpdateBalances | SwitchTokens | SetInputAmount | SetOutputAmount | SetHelper | SetInputExact | SelectToken;
export type SwapDispatch = (actions: TradeDispatchAction | TradeDispatchAction[]) => void;

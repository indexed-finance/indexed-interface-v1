import { BigNumber, UniswapHelper } from "ndx-dummy";
import { TradeToken } from "../reducers/trade-reducer";

// Reducer only
export type SetInputToken = { type: 'SET_INPUT_TOKEN', token: TradeToken };
export type SetOutputToken = { type: 'SET_OUTPUT_TOKEN', token: TradeToken };
export type SetUniswapHelper = { type: 'SET_UNISWAP_HELPER', helper: UniswapHelper };
export type SetPrice = { type: 'SET_PRICE', price: string };


// Middleware only
export type UpdateBalances = { type: 'UPDATE_POOL', clearInputs?: boolean };
export type SwitchTokens = { type: 'SWITCH_TOKENS' };
export type SetInputAmount = { type: 'SET_INPUT_AMOUNT', amount: string };
export type SetInputExact = { type: 'SET_INPUT_EXACT', amount: BigNumber };
export type SetOutputAmount = { type: 'SET_OUTPUT_AMOUNT', amount: string };
export type SelectWhitelistToken = { type: 'SELECT_WHITELIST_TOKEN', index: number };

export type TradeDispatchAction = SetInputToken | SetOutputToken | SetUniswapHelper | SetPrice;
export type TradeMiddlewareAction = UpdateBalances | SwitchTokens | SetInputAmount | SetOutputAmount | SetUniswapHelper | SetInputExact | SelectWhitelistToken;
export type TradeDispatch = (actions: TradeDispatchAction | TradeDispatchAction[]) => void;

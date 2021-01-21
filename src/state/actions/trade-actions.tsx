import { BigNumber, UniswapHelper } from "@indexed-finance/indexed.js";
import { TradeToken } from "../reducers/trade-reducer";

// Reducer only
export type SetInputToken = { type: 'SET_INPUT_TOKEN', token: TradeToken };
export type SetOutputToken = { type: 'SET_OUTPUT_TOKEN', token: TradeToken };
export type SetUniswapHelper = { type: 'SET_UNISWAP_HELPER', helper: UniswapHelper };
export type SetPrice = { type: 'SET_PRICE', price: BigNumber };
export type SetPriceLoading = { type: 'SET_PRICE_LOADING' };
export type SetPriceLoadingSuccess = { type: 'SET_PRICE_LOADING_SUCCESS' };
export type SetSpecifiedSide = { type: 'SET_SIDE', side: 'input' | 'output' };
export type SetRelatedInputUpdated = { type: 'SET_RELATED_INPUT_UPDATED', payload: 'input' | 'output' | null }

// Middleware only
export type UpdateBalances = { type: 'UPDATE_POOL', clearInputs?: boolean };
export type SwitchTokens = { type: 'SWITCH_TOKENS' };
export type SetInputAmount = { type: 'SET_INPUT_AMOUNT', amount: string };
export type SetInputExact = { type: 'SET_INPUT_EXACT', amount: BigNumber };
export type SetOutputAmount = { type: 'SET_OUTPUT_AMOUNT', amount: string };
export type UpdatePrice = { type: 'UPDATE_PRICE' };
export type SelectWhitelistToken = { type: 'SELECT_WHITELIST_TOKEN', index: number };

export type TradeDispatchAction = SetInputToken | SetOutputToken | SetUniswapHelper | SetPrice | SetSpecifiedSide | SetPriceLoading | SetPriceLoadingSuccess | SetRelatedInputUpdated;
export type TradeMiddlewareAction = UpdateBalances | SwitchTokens | SetInputAmount | SetOutputAmount | SetUniswapHelper | SetInputExact | SelectWhitelistToken | UpdatePrice;
export type TradeDispatch = (actions: TradeDispatchAction | TradeDispatchAction[]) => void;

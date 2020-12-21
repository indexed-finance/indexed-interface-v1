import { BigNumber, PoolHelper } from "@indexed-finance/indexed.js";
import { MintParams } from '@indexed-finance/indexed.js/dist/minter/types'
import Minter from '@indexed-finance/indexed.js/dist/minter';
import { UniswapMinterToken } from '../reducers/uniswap-minter-reducer';

// Reducer only
export type SetInputToken = { type: 'SET_INPUT_TOKEN', token: UniswapMinterToken };
export type SetOutputToken = { type: 'SET_OUTPUT_TOKEN', token: UniswapMinterToken };
export type SetMinter = { type: 'SET_MINTER', pool: PoolHelper, minter: Minter };
export type SetSlippage = { type: 'SET_SLIPPAGE', slippage: number };
export type SetSpecifiedSide = { type: 'SET_SPECIFIED_SIDE', side: 'input' | 'output' };
export type SetParams = { type: 'SET_PARAMS', params: MintParams };
export type ToggleDisplay = { type: 'TOGGLE_DISPLAY' };
export type SetLoading = { type: 'SET_LOADING', loading: boolean };

// Middleware only
export type SetHelper = { type: 'SET_HELPER', pool: PoolHelper };
export type UpdateBalances = { type: 'UPDATE_POOL', clearInputs?: boolean };
export type SetInputAmount = { type: 'SET_INPUT_AMOUNT', amount: string };
export type SetInputExact = { type: 'SET_INPUT_EXACT', amount: BigNumber };
export type SetOutputAmount = { type: 'SET_OUTPUT_AMOUNT', amount: string };
export type SelectToken = { type: 'SELECT_TOKEN', index: number };
export type UpdateParams = { type: 'UPDATE_PARAMS' };

export type UniswapMinterDispatchAction = SetSlippage | SetSpecifiedSide | SetInputToken | SetOutputToken | SetMinter | SetParams | ToggleDisplay | SetLoading;
export type UniswapMinterMiddlewareAction = UpdateBalances | SetInputAmount | SetOutputAmount | SetHelper | SetInputExact | SelectToken | UpdateParams;
export type UniswapMinterDispatch = (actions: UniswapMinterDispatchAction | UniswapMinterDispatchAction[]) => void;

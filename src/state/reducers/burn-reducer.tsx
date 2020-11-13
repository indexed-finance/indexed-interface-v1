import { BigNumber, formatBalance, PoolHelper } from "@indexed-finance/indexed.js";
import { InitializedPool, PoolToken } from "@indexed-finance/indexed.js/dist/types";
import { useReducer } from "react";

import {
  SetSingleAmount,
  SetAllAmount,
  SetPoolAmount,
  ToggleToken,
  BurnDispatchAction,
  SetHelper,
  MiddlewareAction,
  SetSpecifiedSide
} from "../actions/burn-actions";
import { withBurnMiddleware } from "../middleware";

const BN_ZERO = new BigNumber(0);

export type BurnState = {
  pool?: PoolHelper;
  tokens?: PoolToken[];
  poolAmountIn: BigNumber;
  poolDisplayAmount: string;
  amounts: BigNumber[];
  displayAmounts: string[];
  selected: boolean[];
  ready: boolean;
  specifiedSide?: 'output' | 'input';
} & ({
  isSingle: true;
  selectedIndex: number;
} | {
  isSingle: false;
  selectedIndex: undefined;
});

const initialState: BurnState = {
  pool: undefined,
  ready: false,
  specifiedSide: null,
  tokens: [] as PoolToken[],
  poolAmountIn: BN_ZERO,
  poolDisplayAmount: '0',
  amounts: [] as BigNumber[],
  displayAmounts: [] as string[],
  selected: [] as boolean[],
  isSingle: false,
  selectedIndex: undefined
};

function burnReducer(state: BurnState = initialState, actions: BurnDispatchAction | BurnDispatchAction[]): BurnState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: BurnState = { ...state };

  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.') || '0';

  const toggleToken = (action: ToggleToken) => {
    const { isSingle, selectedIndex } = newState;
    const { index } = action;
    if (isSingle && index === selectedIndex) {
      newState.selectedIndex = undefined;
      newState.selected = newState.tokens.map(t => t.ready);
      newState.isSingle = false;
    } else {
      newState.isSingle = true;
      newState.selectedIndex = index;
      newState.selected = new Array(newState.tokens.length).fill(false);
      newState.selected[index] = true;
    }
  };

  const setPoolAmount = (action: SetPoolAmount) => {
    newState.poolAmountIn = action.amount;
    newState.poolDisplayAmount = cleanInputAmount(action.displayAmount);
  };

  const setSingle = (action: SetSingleAmount) => {
    newState.amounts[action.index] = action.amount;
    newState.displayAmounts[action.index] = cleanInputAmount(action.displayAmount);
  }

  const setAll = (action: SetAllAmount) => {
    newState.amounts = action.amounts;
    newState.displayAmounts = action.displayAmounts.map(cleanInputAmount);
  }

  const setSide = (action: SetSpecifiedSide) => {
    console.log(`Set Side:: ${action.side}`)
    newState.specifiedSide = action.side;
  }

  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;
    newState.tokens = [...action.pool.tokens.map(t => Object.assign({}, t))];
    newState.amounts = new Array(newState.tokens.length).fill(BN_ZERO);
    newState.displayAmounts = new Array(newState.tokens.length).fill('0');
    newState.selected = newState.tokens.map(t => t.ready);
  }

  const clearAll = () => {
    const size = newState.tokens.length;
    newState.amounts = new Array(size).fill(BN_ZERO);
    newState.displayAmounts = new Array(size).fill('0');
  }

  for (let action of actions) {
    switch (action.type) {
      case 'TOGGLE_SELECT_TOKEN': { toggleToken(action); break; }
      case 'SET_POOL_AMOUNT': { setPoolAmount(action); break; }
      case 'SET_SINGLE_AMOUNT': { setSingle(action); break; }
      case 'SET_ALL_AMOUNTS': { setAll(action); break; }
      case 'SET_POOL_HELPER': { setHelper(action); break; }
      case 'SET_SPECIFIED_SIDE': { setSide(action); break; }
      case 'CLEAR_ALL_AMOUNTS': { clearAll(); break; }
    }
  }

  let validInputs = true;
  newState.tokens.forEach((token, i) => {
    if (newState.amounts[i].gt(token.usedBalance.div(3))) {
      validInputs = false;
    }
  });

  let isReady = validInputs && !newState.poolAmountIn.eq(0) &&
    newState.pool &&
    newState.pool.userPoolBalance &&
    newState.pool.userPoolBalance.gte(newState.poolAmountIn);
  newState.ready = isReady;

  return newState;
}

export function useBurnTokenActions(
  state: BurnState,
  dispatch: (action: BurnDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
) {
  let { address, decimals, name, symbol, ready, usedBalance: poolBalance } = state.tokens[index];

  let balance = state.pool.userAddress ? state.pool.userBalances[address] : BN_ZERO;
  let amount = state.amounts[index];
  let selected = state.selected[index];

  let displayAmount = state.displayAmounts[index];
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let disableInput = !selected;
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_OUTPUT', index, amount: input });
  let updateBalance = () => dispatch({ type: 'UPDATE_POOL' });
  let tokenDisabled = !ready;

  let maximumOutput = poolBalance.div(3);
  let errorMessage = '';
  if (amount.gt(maximumOutput)) {
    errorMessage = 'EXCEEDS MAX OUT';
  }

  return {
    target: state.pool.address,
    updateBalance,
    address,
    decimals,
    name,
    symbol,
    displayAmount,
    displayBalance,
    toggleSelect: toggle,
    errorMessage,
    bindSelectButton: {
      disabled: tokenDisabled,
      checked: selected,
    },
    bindInput: {
      disabled: disableInput,
      value: displayAmount,
      name: symbol,
      onChange: (event) => {
        event.preventDefault();
        let value = event.target.value;
        console.log(`Got On Change Input::`, value);
        if (value === displayAmount) return;
        updateAmount(value);
      }
    }
  }
}

export type TokenActions = {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  displayAmount: string;
  errorMessage: string;
  toggleSelect: () => void;
  bindSelectButton: {
    disabled: boolean;
    checked: boolean;
  };
  bindInput: {
    disabled: boolean;
    value: string;
    name: string;
    onChange: (event: Event) => void;
  }
};

export type BurnContextType = {
  balance: BigNumber;
  displayBalance: string;
  setAmountToBalance: () => void;
  useToken: (index: number) => TokenActions;
  setPoolAmount: (amount: string | number) => void;
  burnState: BurnState;
  setHelper: (helper: PoolHelper) => void;
  updatePool: () => void;
  bindPoolAmountInput: {
    value: string;
    onChange: (event: any) => void;
  }
}

export function useBurn(): BurnContextType {
  const [burnState, burnDispatch] = useReducer(burnReducer, initialState);
  const dispatch = withBurnMiddleware(burnState, burnDispatch);
  const balance = (burnState.pool && burnState.pool.userPoolBalance) || BN_ZERO;
  const displayBalance = formatBalance(balance, 18, 4);
  const useToken = (index: number): TokenActions => useBurnTokenActions(burnState, dispatch, index);
  const setPoolAmount = (amount: string | number) => {
    // This can be triggered by the `onChange` handler for either input, so make sure the value is different before updating.
    if (amount !== burnState.poolDisplayAmount) {
      dispatch({ type: 'SET_POOL_INPUT', amount });
    } else {
      console.log(`Skipped update because amount did not change`)
    }
  }
  const setAmountToBalance = () => dispatch({ type: 'SET_POOL_EXACT', amount: balance })
  const setHelper = (helper: PoolHelper) => dispatch({ type: 'SET_POOL_HELPER', pool: helper });
  const updatePool = () => dispatch({ type: 'UPDATE_POOL' });

  return {
    balance,
    displayBalance,
    setAmountToBalance,
    useToken,
    burnState,
    setHelper,
    updatePool,
    setPoolAmount,
    bindPoolAmountInput: {
      value: burnState.poolDisplayAmount,
      onChange: (event) => {
        setPoolAmount(event.target.value);
      }
    }
  };
}

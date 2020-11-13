import { BigNumber, formatBalance, PoolHelper } from "@indexed-finance/indexed.js";
import { PoolToken } from "@indexed-finance/indexed.js/dist/types";
import { useReducer } from "react";

import {
  SetSingleAmount,
  SetAllAmount,
  SetPoolAmount,
  ToggleToken,
  MintDispatchAction,
  SetHelper,
  MiddlewareAction,
  SetSpecifiedSide
} from "../actions/mint-actions";
import { withMintMiddleware } from "../middleware";

const BN_ZERO = new BigNumber(0);

export type MintState = {
  pool?: PoolHelper;
  tokens?: PoolToken[];
  poolAmountOut: BigNumber;
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

const initialState: MintState = {
  pool: undefined,
  ready: false,
  specifiedSide: null,
  tokens: [] as PoolToken[],
  poolAmountOut: BN_ZERO,
  poolDisplayAmount: '0',
  amounts: [] as BigNumber[],
  displayAmounts: [] as string[],
  selected: [] as boolean[],
  isSingle: false,
  selectedIndex: undefined
};

function mintReducer(state: MintState = initialState, actions: MintDispatchAction | MintDispatchAction[]): MintState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: MintState = { ...state };

  const toggleToken = (action: ToggleToken) => {
    const { isSingle, selectedIndex } = newState;
    const { index } = action;
    if (isSingle && index === selectedIndex) {
      newState.selectedIndex = undefined;
      newState.selected = new Array(newState.tokens.length).fill(true);
      newState.isSingle = false;
    } else {
      newState.isSingle = true;
      newState.selectedIndex = index;
      newState.selected = new Array(newState.tokens.length).fill(false);
      newState.selected[index] = true;
    }
  };

  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.') || '0';

  const setPoolAmount = (action: SetPoolAmount) => {
    newState.poolAmountOut = action.amount;
    newState.poolDisplayAmount = cleanInputAmount(action.displayAmount);
  };

  const setSingle = (action: SetSingleAmount) => {
    newState.amounts[action.index] = action.amount;
    newState.displayAmounts[action.index] = cleanInputAmount(action.displayAmount);
  }

  const setAll = (action: SetAllAmount) => {
    newState.amounts = action.amounts;
    newState.displayAmounts = action.displayAmounts.map(a => cleanInputAmount(a));
  }

  const clearAll = () => {
    const size = newState.tokens.length;
    newState.amounts = new Array(size).fill(BN_ZERO);
    newState.displayAmounts = new Array(size).fill('0');
  }

  const setSide = (action: SetSpecifiedSide) => {
    newState.specifiedSide = action.side;
  }

  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;

    newState.tokens = [...action.pool.tokens.map(t => Object.assign({}, t))];
    newState.amounts = new Array(newState.tokens.length).fill(BN_ZERO);
    newState.selected = new Array(newState.tokens.length).fill(true);
    newState.displayAmounts = new Array(newState.tokens.length).fill('0');
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

  let isReady = !newState.poolAmountOut.eq(0) && newState.amounts.filter((amount, i) => {
    let token = newState.tokens[i].address;
    let allowance = newState.pool.userAllowances[token] || BN_ZERO;
    return allowance.gte(amount);
  }).length === newState.tokens.length;
  newState.ready = isReady;
  return newState;
}

export function useMintTokenActions(
  state: MintState,
  dispatch: (action: MintDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
): TokenActions {
  let { address, decimals, name, symbol, usedBalance: poolBalance } = state.tokens[index];

  let allowance = (state.pool.userAddress && state.pool.userAllowances[address]) || BN_ZERO;
  let balance = (state.pool.userAddress && state.pool.userBalances[address]) || BN_ZERO;
  let amount = state.amounts[index];
  let selected = state.selected[index];

  let displayAmount = state.displayAmounts[index] || '0';
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
  let approvalNeeded = approvalRemainder.gt(BN_ZERO);

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_INPUT', index, amount: input });
  let setAmountToBalance = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: balance });
  let updateDidApprove = () => dispatch({ type: 'UPDATE_POOL' });

  let errorMessage = '';
  let maximumInput = poolBalance.div(2);
  if (amount.gt(balance)) {
    errorMessage = 'EXCEEDS BALANCE';
  } else if (amount.gt(maximumInput)) {
    errorMessage = 'EXCEEDS MAX IN';
  }

  let disableInput = !selected || !(state.isSingle);
  let disableApprove = !approvalNeeded || !selected || balance.lt(approvalRemainder);

  return {
    target: state.pool.address,
    updateDidApprove,
    address,
    decimals,
    errorMessage,
    name,
    symbol,
    approvalNeeded,
    displayAmount,
    displayBalance,
    approvalRemainder,
    setAmountToBalance,
    toggleSelect: toggle,
    bindSelectButton: {
      disabled: disableApprove,
      checked: selected,
    },
    bindApproveInput: {
      disabled: disableInput,
      value: displayAmount || '0',
      name: symbol,
      onChange: (event) => {
        event.preventDefault();
        let value = event.target.value;
        if (value !== displayAmount) {
          updateAmount(value);
        }
      }
    }
  }
}

export type TokenActions = {
  target: string;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  errorMessage: string;
  approvalRemainder: BigNumber;
  approvalNeeded: boolean;
  displayAmount: string;
  displayBalance: string;
  setAmountToBalance: () => void;
  toggleSelect: () => void;
  updateDidApprove: () => void;
  bindSelectButton: {
    disabled: boolean;
    checked: boolean;
  };
  bindApproveInput: {
    disabled: boolean;
    value: string;
    name: string;
    onChange: (event: any) => void;
  }
};

export type MintContextType = {
  useToken: (index: number) => TokenActions;
  setPoolAmount: (amount: string | number) => void;
  mintState: MintState;
  setHelper: (helper: PoolHelper) => void;
}

export function useMint() {
  const [mintState, mintDispatch] = useReducer(mintReducer, initialState);
  const dispatch = withMintMiddleware(mintState, mintDispatch);
  const useToken = (index: number): TokenActions => useMintTokenActions(mintState, dispatch, index);

  const setPoolAmount = (amount: string | number) => {
    if (amount !== mintState.poolDisplayAmount) {
      dispatch({ type: 'SET_POOL_OUTPUT', amount: amount/*  || '0' */ });
    }
  }
  const setHelper = (helper: PoolHelper) => dispatch({ type: 'SET_POOL_HELPER', pool: helper });
  const updatePool = () => dispatch({ type: 'UPDATE_POOL' });

  return {
    useToken,
    mintState,
    setHelper,
    updatePool,
    bindPoolAmountInput: {
      value: mintState.poolDisplayAmount || '0',
      onChange: (event) => {
        event.preventDefault();
        setPoolAmount(event.target.value);
      }
    }
  };
}

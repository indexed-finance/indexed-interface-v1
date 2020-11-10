import { BigNumber, formatBalance, PoolHelper, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { PoolToken } from "@indexed-finance/indexed.js/dist/types";
import { useReducer } from "react";

import {
  SetSingleAmount,
  SetAllAmount,
  SetPoolAmount,
  ToggleToken,
  MintDispatchAction,
  SetHelper, MiddlewareAction
} from "../actions/mint-actions";
import { withMintMiddleware } from "../middleware";

const BN_ZERO = new BigNumber(0);

export type MintState = {
  pool?: PoolHelper;
  tokens?: PoolToken[];
  poolAmountOut: BigNumber;
  poolDisplayAmount: string;
  balances: BigNumber[];
  amounts: BigNumber[];
  allowances: BigNumber[];
  selected: boolean[];
} & ({
  isSingle: true;
  selectedIndex: number;
} | {
  isSingle: false;
  selectedIndex: undefined;
});

const initialState: MintState = {
  pool: undefined,
  tokens: [] as PoolToken[],
  poolAmountOut: BN_ZERO,
  poolDisplayAmount: '0',
  balances: [] as BigNumber[],
  amounts: [] as BigNumber[],
  allowances: [] as BigNumber[],
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
    const { isSingle, selectedIndex  } = newState;
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
  const setPoolAmount = (action: SetPoolAmount) => {
    newState.poolAmountOut = action.amount;
    newState.poolDisplayAmount = formatBalance(action.amount, 18, 4);
  };
  const setSingle = (action: SetSingleAmount) => {
    newState.amounts[action.index] = action.amount;
  }
  const setAll = (action: SetAllAmount) => {
    newState.amounts = action.amounts;
  }
  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;
    newState.tokens = [...action.pool.tokens.map(t => Object.assign({}, t))];
    let size = newState.tokens.length;
    newState.amounts = new Array(size).fill(BN_ZERO);
    newState.allowances = new Array(size).fill(BN_ZERO);
    newState.balances = new Array(size).fill(BN_ZERO);
    newState.selected = new Array(newState.tokens.length).fill(true);
  }
  for (let action of actions) {
    switch (action.type) {
      case 'TOGGLE_SELECT_TOKEN': { toggleToken(action); break; }
      case 'SET_POOL_AMOUNT': { setPoolAmount(action); break; }
      case 'SET_SINGLE_AMOUNT': { setSingle(action); break; }
      case 'SET_ALL_AMOUNTS': { setAll(action); break; }
      case 'SET_POOL_HELPER': { setHelper(action); break; }
    }
  }
  return newState;
}

export function useMintTokenActions(
  state: MintState,
  dispatch: (action: MintDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
) {
  let { address, decimals, name, symbol } = state.tokens[index];

  let allowance = state.allowances[index];
  let balance = state.balances[index];
  let amount = state.amounts[index];
  let selected = state.selected[index];

  let displayAmount = amount.eq(BN_ZERO) ? '0' : formatBalance(amount, decimals, 4);
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
  let approvalNeeded = approvalRemainder.gt(BN_ZERO);

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let disableInput = !selected || !(state.isSingle);
  let disableApprove = !approvalNeeded || !selected || balance.lt(approvalRemainder);
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_INPUT', index, amount: input });
  let setAmountToBalance = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: balance });

  return {
    address,
    decimals,
    name,
    symbol,
    approvalNeeded,
    displayAmount,
    displayBalance,
    setAmountToBalance,
    bindApproveButton: {
      disabled: disableApprove,
      checked: selected,
      onClick: toggle
    },
    bindApproveInput: {
      disabled: disableInput,
      value: displayAmount,
      name: symbol,
      onChange: (event) => {
        event.preventDefault();
        let value = event.target.value;
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
  approvalNeeded: boolean;
  displayAmount: string;
  displayBalance: string;
  setAmountToBalance: () => void;
  bindApproveButton: {
    disabled: boolean;
    checked: boolean;
    onClick: () => void;
  };
  bindApproveInput: {
    disabled: boolean;
    value: string;
    name: string;
    onChange: (event: Event) => void;
  }
};

export type MintContextType = {
  useToken: (index: number) => TokenActions;
  setPoolAmount: (amount: string | number) => void;
  mintState: MintState;
  setHelper: (helper: PoolHelper) => void;
}

export function useMint() {
  const [mintState, mintDispatch] = useReducer(mintReducer, undefined);
  const dispatch = withMintMiddleware(mintState, mintDispatch);
  const useToken = (index: number): TokenActions => useMintTokenActions(mintState, dispatch, index);
  const setPoolAmount = (amount: string | number) => dispatch({ type: 'SET_POOL_OUTPUT', amount });
  const setHelper = (helper: PoolHelper) => dispatch({ type: 'SET_POOL_HELPER', pool: helper });
  return {
    useToken,
    setPoolAmount,
    mintState,
    setHelper,
  };
}

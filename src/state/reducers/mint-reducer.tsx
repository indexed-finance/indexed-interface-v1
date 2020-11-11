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
  balances: BigNumber[];
  amounts: BigNumber[];
  allowances: BigNumber[];
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
  let didUpdateUserData = false;

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

  const setSide = (action: SetSpecifiedSide) => {
    console.log(`Set Side:: ${action.side}`)
    newState.specifiedSide = action.side;
  }

  const updateUserData = () => {
    if (didUpdateUserData) return;
    let size = newState.tokens.length;
    let addresses = newState.pool.tokens.map(t => t.address);
    if (newState.pool.userAddress) {
      newState.balances = addresses.map(t => new BigNumber(newState.pool.userBalances[t] || BN_ZERO));
      newState.allowances = addresses.map(t => new BigNumber(newState.pool.userAllowances[t] || BN_ZERO));
    } else {
      newState.allowances = new Array(size).fill(BN_ZERO);
      newState.balances = new Array(size).fill(BN_ZERO);
    }
    didUpdateUserData = true;
  }

  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;

    newState.tokens = [...action.pool.tokens.map(t => Object.assign({}, t))];
    newState.amounts = new Array(newState.tokens.length).fill(BN_ZERO);
    newState.selected = new Array(newState.tokens.length).fill(true);
    updateUserData();
  }

  for (let action of actions) {
    switch (action.type) {
      case 'TOGGLE_SELECT_TOKEN': { toggleToken(action); break; }
      case 'SET_POOL_AMOUNT': { setPoolAmount(action); break; }
      case 'SET_SINGLE_AMOUNT': { setSingle(action); break; }
      case 'SET_ALL_AMOUNTS': { setAll(action); break; }
      case 'SET_POOL_HELPER': { setHelper(action); break; }
      case 'SET_SPECIFIED_SIDE': { setSide(action); break; }
    }
  }
  updateUserData();

  let isReady = !newState.poolAmountOut.eq(0) && newState.amounts.filter((amount, i) => {
    return newState.allowances[i].gte(amount);
  }).length === newState.tokens.length;
  newState.ready = isReady;
  return newState;
}

export function useMintTokenActions(
  state: MintState,
  dispatch: (action: MintDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
): TokenActions {
  let { address, decimals, name, symbol } = state.tokens[index];

  let allowance = state.pool.userAddress ? state.pool.userAllowances[address] : BN_ZERO;
  let balance = state.pool.userAddress ? state.pool.userBalances[address] : BN_ZERO;
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
  let updateDidApprove = () => dispatch({ type: 'UPDATE_POOL' });

  return {
    target: state.pool.address,
    updateDidApprove,
    address,
    decimals,
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
      // onClick: toggle
    },
    bindApproveInput: {
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
  target: string;
  address: string;
  decimals: number;
  name: string;
  symbol: string;
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
    // This can be triggered by the `onChange` handler for either input, so make sure the value is different before updating.
    if (amount !== mintState.poolDisplayAmount) {
      dispatch({ type: 'SET_POOL_OUTPUT', amount });
    } else {
      console.log(`Skipped update because amount did not change`)
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
      value: mintState.poolDisplayAmount,
      onChange: (event) => {
        setPoolAmount(event.target.value);
      }
    }
  };
}

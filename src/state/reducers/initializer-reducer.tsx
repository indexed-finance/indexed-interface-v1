import { BigNumber, formatBalance, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { InitializerToken } from "@indexed-finance/indexed.js/dist/types";
import { InitializerHelper } from "@indexed-finance/indexed.js/dist/initializer-helper"
import { useReducer } from "react";

import {
  ToggleToken,
  InitDispatchAction,
  SetHelper,
  MiddlewareAction,
  SetTokenAmount, UpdatePool, SetAll
} from "../actions/initializer-actions";

import { withInitMiddleware } from "../middleware/index";

const BN_ZERO = new BigNumber(0);

export type InitializerState = {
  pool: InitializerHelper;
  tokens?: InitializerToken[];
  amounts: BigNumber[];
  selected: boolean[];
  creditEthTotal: BigNumber;
  creditEthPerToken: BigNumber[];
  isSingle: boolean;
  selectedIndex?: number;
};

const initialState: InitializerState = {
  pool: undefined,
  tokens: [] as InitializerToken[],
  creditEthTotal: BN_ZERO,
  creditEthPerToken: [] as BigNumber[],
  amounts: [] as BigNumber[],
  selected: [] as boolean[],
  isSingle: false
};

function initializerReducer(state: InitializerState = initialState, actions: InitDispatchAction | InitDispatchAction[]): InitializerState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: InitializerState = { ...state };
  
  const updateCreditTotal = () => {
    newState.creditEthTotal = newState.creditEthPerToken.reduce(
      (total, credit) => total.plus(credit),
      BN_ZERO
    );
  };

  const toggleToken = (action: ToggleToken) => {
    const { index } = action;
    let wasSelected = newState.selected[index];
    newState.selected[index] = !wasSelected;
    newState.isSingle = newState.selected.filter(x => x).length === 1;
    if (wasSelected) {
      newState.amounts[index] = BN_ZERO;
      newState.creditEthPerToken[index] = BN_ZERO;
    }
    if (newState.isSingle) {
      newState.selectedIndex = newState.selected.indexOf(true);
    } else {
      newState.selectedIndex = undefined;
    }
    updateCreditTotal();
  };

  const setTokenAmount = (action: SetTokenAmount) => {
    newState.amounts[action.index] = action.amount;
    newState.creditEthPerToken[action.index] = action.credit;
    updateCreditTotal();
  };

  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;
    let tokens = action.pool.tokens.filter(t => t.amountRemaining.gt(0));
    newState.tokens = [...tokens.map(t => Object.assign({}, t))];
    let size = newState.tokens.length;
    newState.amounts = new Array(size).fill(BN_ZERO);
    newState.selected = new Array(size).fill(false);
    newState.creditEthPerToken = new Array(size).fill(BN_ZERO);
  };

  const setAll = (action: SetAll) => {
    newState.tokens = action.tokens;
    newState.amounts = action.amounts;
    newState.creditEthPerToken = action.credits;
    updateCreditTotal();    
  }

  for (let action of actions) {
    switch (action.type) {
      case 'TOGGLE_SELECT_TOKEN': { toggleToken(action); break; }
      case 'SET_TOKEN_AMOUNT': { setTokenAmount(action); break; }
      case 'SET_POOL_HELPER': { setHelper(action); break; }
      case 'SET_ALL': { setAll(action); break; }
    }
  }
  return newState;
}

export function useInitializerToken(
  state: InitializerState,
  dispatch: (action: InitDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
): TokenActions {
  let { address, decimals, name, symbol } = state.tokens[index];
  let { pool } = state

  let allowance = new BigNumber(state.pool.userAllowances[address] || 0);
  let balance =  new BigNumber(state.pool.userBalances[address] || 0);
  let amount =  state.amounts[index];
  let selected = state.selected[index];

  let displayAmount = amount.eq(BN_ZERO) ? '0' : formatBalance(amount, decimals, 4);
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
  let approvalNeeded = approvalRemainder.gt(BN_ZERO);

  let displayCredit = formatBalance(state.creditEthPerToken[index], 18, 4);

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let disableInput = !selected
  let disableApprove = !approvalNeeded || !selected || balance.lt(approvalRemainder);
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_INPUT', index, amount: input });
  let setAmountToBalance = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: balance });
  let updateDidApprove = () => dispatch({ type: 'UPDATE_POOL' });

  let symbolAdornment = amount.eq(0) ? null : `Ξ${displayCredit}`;
  let { balance: currentBalance, targetBalance } = state.pool.getTokenByAddress(address);
  let percentOfDesired = currentBalance.div(targetBalance).times(100).toNumber();

  return {
    target: pool.address,
    address,
    decimals,
    name,
    symbol,
    currentBalance: formatBalance(currentBalance, decimals, 4),
    targetBalance: formatBalance(targetBalance, decimals, 4),
    percentOfDesired,
    symbolAdornment,
    approvalNeeded,
    approvalRemainder,
    displayAmount,
    displayBalance,
    setAmountToBalance,
    toggleSelect: toggle,
    updateDidApprove,
    bindSelectButton: {
      disabled: disableApprove,
      checked: selected,
    },
    bindApproveInput: {
      disabled: disableInput,
      value: displayAmount,
      name: symbol,
      onChange: (event) => {
        let value = event.target.value;
        updateAmount(value);
      }
    }
  }
}

export type TokenActions = {
  target: string;
  address: string;
  currentBalance: string,
  targetBalance: string,
  approvalRemainder: BigNumber;
  percentOfDesired?: number;
  decimals: number;
  name: string;
  symbol: string;
  approvalNeeded: boolean;
  displayAmount: string;
  displayBalance: string;
  symbolAdornment: string | null;
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

export type InitContextType = {
  useToken: (index: number) => TokenActions;
  initState: InitializerState;
  setHelper: (helper: InitializerHelper) => void;
  displayTotalCredit: string;
  displayPoolTotalCredit: string;
  displayUserCredit: string;
  updatePool: () => void;
}

export function useInitializerReducer(): InitContextType {
  const [initState, initDispatch] = useReducer(initializerReducer, initialState);
  const dispatch = withInitMiddleware(initState, initDispatch);
  const useToken = (index: number): TokenActions => useInitializerToken(initState, dispatch, index);
  const setHelper = (helper: InitializerHelper) => dispatch({ type: 'SET_POOL_HELPER', pool: helper });
  const totalCredit = initState.creditEthTotal;
  const displayTotalCredit = formatBalance(totalCredit, 18, 4);
  const updatePool = () => dispatch({ type: 'UPDATE_POOL' });
  const displayUserCredit = initState.pool ? formatBalance(initState.pool.userCredit, 18, 4) : '0';
  const displayPoolTotalCredit = initState.pool ? formatBalance(initState.pool.totalCreditedWETH, 18, 4) : '0';

  return {
    useToken,
    initState,
    setHelper,
    displayTotalCredit,
    displayUserCredit,
    displayPoolTotalCredit,
    updatePool
  };
}

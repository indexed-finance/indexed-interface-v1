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
  displayAmounts: string[];
  selected: boolean[];
  creditEthTotal: BigNumber;
  creditEthPerToken: BigNumber[];
  isSingle: boolean;
  selectedIndex?: number;
  currentValue: BigNumber;
  finalValueEstimate: BigNumber;
};

const initialState: InitializerState = {
  pool: undefined,
  tokens: [] as InitializerToken[],
  creditEthTotal: BN_ZERO,
  creditEthPerToken: [] as BigNumber[],
  amounts: [] as BigNumber[],
  displayAmounts: [] as string[],
  selected: [] as boolean[],
  isSingle: false,
  currentValue: BN_ZERO,
  finalValueEstimate: BN_ZERO
};

function initializerReducer(state: InitializerState = initialState, actions: InitDispatchAction | InitDispatchAction[]): InitializerState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: InitializerState = { ...state };
  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.');
  
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
    newState.displayAmounts[action.index] = cleanInputAmount(action.displayAmount);
    newState.creditEthPerToken[action.index] = action.credit;
    updateCreditTotal();
  };

  const setHelper = (action: SetHelper) => {
    newState.pool = action.pool;
    let tokens = action.pool.tokens.filter(t => t.amountRemaining.gt(0));
    newState.tokens = [...tokens.map(t => Object.assign({}, t))];
    let size = newState.tokens.length;
    newState.amounts = new Array(size).fill(BN_ZERO);
    newState.displayAmounts = new Array(size).fill('0');
    newState.selected = new Array(size).fill(false);
    newState.creditEthPerToken = new Array(size).fill(BN_ZERO);
  };

  const setAll = (action: SetAll) => {
    newState.tokens = action.tokens;
    newState.amounts = action.amounts;
    newState.displayAmounts = action.displayAmounts.map(cleanInputAmount);
    newState.creditEthPerToken = action.credits;
    newState.currentValue = action.currentValue;
    newState.finalValueEstimate = action.finalValueEstimate;
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
  let { address, decimals, name, symbol, amountRemaining } = state.tokens[index];
  let { pool } = state

  let allowance = new BigNumber(state.pool.userAllowances[address] || 0);
  let balance =  new BigNumber(state.pool.userBalances[address] || 0);
  let amount =  state.amounts[index];
  let selected = state.selected[index];

  let displayAmount = state.displayAmounts[index];
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let approvalNeeded = allowance.lt(amount);

  let displayCredit = formatBalance(state.creditEthPerToken[index], 18, 4);

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let disableInput = !selected
  let disableApprove = !approvalNeeded || !selected || balance.lt(amount);
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_INPUT', index, amount: input });
  let setAmountToBalance = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: balance });
  let setAmountToRemainder = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: amountRemaining });

  let displayAmountRemaining = formatBalance(amountRemaining, decimals, 4);
  let bindSetRemainderButton = {
    value: `DESIRED: ${displayAmountRemaining}`,
    disabled: balance.lt(amountRemaining),
    onClick: setAmountToRemainder
  }

  let updateDidApprove = () => dispatch({ type: 'UPDATE_POOL' });

  let symbolAdornment = amount.eq(0) ? null : `Ξ${displayCredit}`;
  let { balance: currentBalance, targetBalance } = state.pool.getTokenByAddress(address);
  let percentOfDesired = currentBalance.div(targetBalance).times(100).toNumber();

  let errorMessage: string = '';
  if (amount.gt(balance)) {
    errorMessage = 'EXCEEDS BALANCE';
  } else if (amount.gt(amountRemaining)) {
    errorMessage = 'EXCEEDS REMAINDER';
  }

  return {
    target: pool.address,
    address,
    decimals,
    name,
    symbol,
    errorMessage,
    displayAmountRemaining,
    amount,
    currentBalance: formatBalance(currentBalance, decimals, 4),
    targetBalance: formatBalance(targetBalance, decimals, 4),
    percentOfDesired,
    symbolAdornment,
    approvalNeeded,
    displayAmount,
    displayBalance,
    setAmountToBalance,
    toggleSelect: toggle,
    updateDidApprove,
    bindSetRemainderButton,
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
  displayAmountRemaining: string;
  amount: BigNumber;
  percentOfDesired?: number;
  decimals: number;
  name: string;
  symbol: string;
  approvalNeeded: boolean;
  displayAmount: string;
  displayBalance: string;
  symbolAdornment: string | null;
  errorMessage: string;
  setAmountToBalance: () => void;
  toggleSelect: () => void;
  updateDidApprove: () => void;
  bindSetRemainderButton: {
    disabled: boolean;
    value: string;
    onClick: () => void;
  }
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
  displayValue: string;
  finalValue: string;
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

  const displayValue = formatBalance(initState.currentValue, 18, 4);
  const finalValue = formatBalance(initState.finalValueEstimate, 18, 4);

  return {
    useToken,
    initState,
    setHelper,
    displayTotalCredit,
    displayUserCredit,
    displayPoolTotalCredit,
    updatePool,
    displayValue,
    finalValue
  };
}

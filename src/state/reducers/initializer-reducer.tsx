import { BigNumber, formatBalance, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { InitializerToken } from "@indexed-finance/indexed.js/dist/types";
import { InitializerHelper } from "@indexed-finance/indexed.js/dist/initializer-helper"
import { useReducer } from "react";

import {
  SetSingleAmount,
  SetAllAmount,
  SetPoolOutput,
  ToggleToken,
  InitDispatchAction,
  SetHelper, MiddlewareAction
} from "../actions/initializer-actions";
import { withInitMiddleware } from "../middleware/index";
import { getERC20 } from '../../lib/erc20';

const BN_ZERO = new BigNumber(0);

export type InitializerState = {
  pool: InitializerHelper;
  tokens?: InitializerToken[];
  poolCreditAmount: BigNumber;
  poolCreditDisplayAmount: string;
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

const initialState: InitializerState = {
  pool: undefined,
  tokens: [] as InitializerToken[],
  poolCreditAmount: BN_ZERO,
  poolCreditDisplayAmount: '0',
  balances: [] as BigNumber[],
  amounts: [] as BigNumber[],
  allowances: [] as BigNumber[],
  selected: [] as boolean[],
  isSingle: false,
  selectedIndex: undefined
};

function initReducer(state: InitializerState = initialState, actions: InitDispatchAction | InitDispatchAction[]): InitializerState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: InitializerState = { ...state };

  const toggleToken = (action: ToggleToken) => {
    const { index } = action;
    newState.selected[index] = !newState.selected[index];
    newState.isSingle = newState.selected.filter(x => x).length === 1;
    if (newState.isSingle) {
      newState.selectedIndex = newState.selected.indexOf(true);
    } else {
      newState.selectedIndex = undefined;
    }
  };

  const setOutput = (action: SetPoolOutput) => {
    newState.poolCreditAmount = action.amount;
    newState.poolCreditDisplayAmount = action.display;
  }

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
      case 'SET_SINGLE_AMOUNT': { setSingle(action); break; }
      case 'SET_ALL_AMOUNTS': { setAll(action); break; }
      case 'SET_POOL_OUTPUT': { setOutput(action); break; }
      case 'SET_POOL_HELPER': { setHelper(action); break; }
    }
  }
  return newState;
}

export function useInitializerStateTokenActions(
  state: InitializerState,
  dispatch: (action: InitDispatchAction | MiddlewareAction) => Promise<void>,
  index: number
) {
  let { address, decimals, name, symbol } = state.tokens[index];
  let { pool } = state

  let allowance = new BigNumber(state.allowances[index]);
  let balance =  new BigNumber(state.balances[index]);
  let amount =  new BigNumber(state.amounts[index]);
  let selected = state.selected[index];

  let displayAmount = amount.eq(BN_ZERO) ? '0' : formatBalance(amount, decimals, 4);
  let displayBalance = balance.eq(BN_ZERO) ? '0' : formatBalance(balance, decimals, 4);

  let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
  let approvalNeeded = approvalRemainder.gt(BN_ZERO);

  const approveRemaining = async(web3, account) => {
    try {
      const erc20 = getERC20(web3, address);

      if (approvalRemainder.gte(0)) {
        await erc20.methods.approve(pool.address, approvalRemainder)
        .send({ from: account })
      }
    } catch(e) { }
  }

  let toggle = () => dispatch({ type: 'TOGGLE_SELECT_TOKEN', index });
  let disableInput = !selected
  let disableApprove = !approvalNeeded || !selected || balance.lt(approvalRemainder);
  let updateAmount = (input: string | number) => dispatch({ type: 'SET_TOKEN_INPUT', index, amount: input });
  let setAmountToBalance = () => dispatch({ type: 'SET_TOKEN_EXACT', index, amount: balance });

  return {
    address,
    decimals,
    name,
    symbol,
    approvalNeeded,
    approveRemaining,
    displayAmount,
    displayBalance,
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
        let value = event.target.value;

        console.log(value)

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
  toggleSelect: () => void;
  bindSelectButton: {
    disabled: boolean;
    checked: boolean;
  };
  bindApproveInput: {
    disabled: boolean;
    value: string;
    name: string;
    onChange: (event: Event) => void;
  }
};

export type InitContextType = {
  useToken: (index: number) => TokenActions;
  setPoolAmount: (amount: string | number) => void;
  initState: InitializerState;
  setHelper: (helper: InitializerHelper) => void;
}

export function useInit() {
  const [initState, initDispatch] = useReducer(initReducer, initialState);
  const dispatch = withInitMiddleware(initState, initDispatch);
  const useToken = (index: number): TokenActions => useInitializerStateTokenActions(initState, dispatch, index);
  const setHelper = (helper: InitializerHelper) => dispatch({ type: 'SET_POOL_HELPER', pool: helper });

  return {
    useToken,
    initState,
    setHelper
  };
}

// function mintReducer(state, action) {
  // const { type, }
// }

import { BigNumber, formatBalance, PoolHelper, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { PoolToken } from "@indexed-finance/indexed.js/dist/types";
import { useReducer } from "react";
import { getERC20 } from "../lib/erc20";

type SetHelper = { type: 'SET_POOL_HELPER', pool: PoolHelper };
type ToggleToken = { type: 'TOGGLE_SELECT_TOKEN', index: number };
type SetPoolAmount = { type: 'SET_POOL_AMOUNT', amount: BigNumber };
type SetSingleAmount = { type: 'SET_SINGLE_AMOUNT', index: number, amount: BigNumber, allowance: BigNumber, balance: BigNumber };
type SetAllAmount = { type: 'SET_ALL_AMOUNTS', amounts: BigNumber[], allowances: BigNumber[], balances: BigNumber[] };

type MintDispatchAction = ToggleToken | SetPoolAmount | SetSingleAmount | SetAllAmount | SetHelper;

type MintState = {
  pool?: PoolHelper;
  tokens?: PoolToken[];
  poolAmountOut: BigNumber;
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

const BN_ZERO = new BigNumber(0);

const initialState: MintState = {
  pool: undefined,
  tokens: [] as PoolToken[],
  poolAmountOut: BN_ZERO,
  balances: [] as BigNumber[],
  amounts: [] as BigNumber[],
  allowances: [] as BigNumber[],
  selected: [] as boolean[],
  isSingle: false,
  selectedIndex: undefined
};

function mintReducer(state = initialState, actions: MintDispatchAction | MintDispatchAction[]): MintState {
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

type MintDispatch = (actions: MintDispatchAction | MintDispatchAction[]) => void;

type SetTokenExact = { type: 'SET_TOKEN_EXACT', index: number, amount: BigNumber };
type SetTokenInput = { type: 'SET_TOKEN_INPUT', index: number, amount: string | number };
type SetPoolOutput = { type: 'SET_POOL_OUTPUT', amount: string | number };
type MiddlewareAction = SetTokenInput | SetPoolOutput | SetTokenExact;

function dispatchMiddleware(dispatch: MintDispatch, state: MintState) {
  return (action: MiddlewareAction | MintDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const singleInGivenPoolOut = async (poolAmountOut: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      const token = tokens[index];
      const result = await pool.calcSingleInGivenPoolOut(token.address, poolAmountOut);
      return [
        { type: 'SET_SINGLE_AMOUNT', index, amount: toBN(result.amount), balance: toBN(result.balance), allowance: toBN(result.allowance) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountOut) }
      ];
    };

    const poolOutGivenSingleIn = async (address: string, exactAmount: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      // const { address, decimals } = tokens[index];
      // const exactAmount = toTokenAmount(tokenAmountIn, decimals);
      const result = await pool.calcPoolOutGivenSingleIn(address, exactAmount);
      const { amount: poolAmount, allowance, balance  } = result;
      return [
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, balance: toBN(balance), allowance: toBN(allowance) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmount) }
      ];
    }

    const allInGivenPoolOut = async (exactAmount: BigNumber): Promise<MintDispatchAction[]> => {
      const result = await pool.calcAllInGivenPoolOut(exactAmount);
      const { balances, allowances, amounts } = result.reduce((obj, { balance, allowance, amount }) => ({
        balances: [...obj.balances, toBN(balance)],
        allowances: [...obj.allowances, toBN(allowance)],
        amounts: [...obj.amounts, toBN(amount)]
      }), { balances: [], allowances: [], amounts: []});
      return [
        { type: 'SET_ALL_AMOUNTS', amounts, balances, allowances },
        { type: 'SET_POOL_AMOUNT', amount: toBN(exactAmount) }
      ];
    }
    
    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { address, decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      return dispatch(await poolOutGivenSingleIn(address, exactAmount, index));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {
      return dispatch(await poolOutGivenSingleIn(state.tokens[index].address, amount, index));
    }

    const setPoolOutput = async ({ amount }: SetPoolOutput): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      const exactAmount = toTokenAmount(amount, 18);
      if (isSingle) {
        return dispatch(await singleInGivenPoolOut(exactAmount, selectedIndex));
      } else {
        return dispatch(await allInGivenPoolOut(exactAmount));
      }
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      if (isSingle && action.index === selectedIndex) {
        const actions = await allInGivenPoolOut(state.poolAmountOut);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const actions = await singleInGivenPoolOut(state.poolAmountOut, action.index);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      }
    }

    const fallback = async (action: MintDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'SET_POOL_OUTPUT': return setPoolOutput(action);
      case 'TOGGLE_SELECT_TOKEN': return toggleToken(action);
      default: return fallback(action);
    }
  }
}

export function useMintToken(
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

export function useMint() {
  const [mintState, mintDispatch] = useReducer(mintReducer, undefined);
  const dispatch = dispatchMiddleware(mintDispatch, mintState);
  // add function with mintActions, place into a context
}

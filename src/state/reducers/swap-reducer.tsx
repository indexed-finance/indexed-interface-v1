import { BigNumber, toWei, formatBalance } from "@indexed-finance/indexed.js";
import { PoolHelper } from '@indexed-finance/indexed.js';
import { useReducer } from "react";
import { setSwapMiddlewareAction, SwapDispatchAction, SetInputToken, SetOutputToken, SetHelper, SetTokens } from "../actions/swap-actions";
import { withTradeMiddleware } from "../middleware/trade-middleware";
import Web3 from 'web3'

const BN_ZERO = new BigNumber(0);

export type SwapToken = {
  address: string;
  decimals: number;
  amount: BigNumber;
  displayAmount: string;
  errorMessage?: string;
}

export type TokenList = Array<{
  symbol: string,
  decimals: number,
  address: string
 }>

export type SwapState = {
  pool?: PoolHelper;
  input: SwapToken;
  output: SwapToken;
  tokenList: TokenList;
  getBalance?: (address: string) => BigNumber;
  getAllowance?: (address: string) => BigNumber;
  ready: boolean;
  poolAddress?: string;
  price: string;
};

const initialState: TradeState = {
  pool: undefined,
  input: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: '0',
  },
  output: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: '0',
  },
  ready: false,
  price: ''
};

const compareAddresses = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase();
}

function swapReducer(state: SwapState = initialState, actions: SwapDispatchAction | SwapDispatchAction[]): SwapState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: SwapState = { ...state };

  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.') || '0';

  function setInput(action: SetInputToken) {
    newState.input = action.token;
    newState.input.displayAmount = cleanInputAmount(action.token.displayAmount);
  }

  function setOutput(action: SetOutputToken) {
    newState.output = action.token;
    newState.output.displayAmount = cleanInputAmount(action.token.displayAmount);
  }

  function setHelper(action: SetHelper) {
    newState.pool = action.helper;
  }

  function setTokens(action: SetTokens){
    newState.tokenList = action.tokens;
  }

  const getBalance = (tokenAddress: string): BigNumber => {
    return newState.pool.userBalances[tokenAddress] || BN_ZERO;
  }

  const getAllowance = (tokenAddress: string): BigNumber => {
    return newState.pool.userAllowances[tokenAddress] || BN_ZERO;
  }

  for (let action of actions) {
    switch (action.type) {
      case 'SET_INPUT_TOKEN': { setInput(action); break; }
      case 'SET_OUTPUT_TOKEN': { setOutput(action); break; }
      case 'SET_TOKENS': { setTokens(action); break; }
      case 'SET_HELPER': { setHelper(action); break; }
      case 'SET_PRICE': { newState.price = action.price; break; }
    }
  }

  let isReady = false;

  if (newState.pool) {
    isReady = true;
    const checkInputToken = () => {
      const { address, amount } = newState.input;
      const balance = getBalance(address);
      const allowance = getAllowance(address);

      // TODO: Calc max swap input

      if (balance.lt(amount)) {
        newState.input.errorMessage = 'INSUFFICIENT BALANCE';
        isReady = false;
      } else {
        newState.input.errorMessage = '';
      }
      if (allowance.lt(amount)) {
        isReady = false;
      }
    };
    const checkOutputToken = () => {
      const { address, amount } = newState.output;

      // TODO: Calc max swap output
      newState.output.errorMessage = '';
    }
    checkInputToken();
    checkOutputToken();
    newState.getAllowance = getAllowance;
    newState.getBalance = getBalance;
    newState.poolAddress = newState.pool.address;
  }
  newState.ready = isReady;
  return newState;
}

export type TokenActions = {
  address: string;
  decimals: number;
  symbol: string;
  displayAmount: string;
  displayBalance: string;
  errorMessage: string;
  isInput: boolean;
  bindInput: {
    value: string;
    name: string;
    onChange: (event: Event) => void;
  },
  setAmountToBalance?: () => void;
  updateBalance: () => void;
  target?: string;
};

export function useSwapTokenActions(
  state: SwapState,
  dispatch: (action: SwapDispatchAction | SwapMiddlewareAction ) => Promise<void>,
  address: string
): TokenActions {
  let isInput = compareAddresses(address, state.input.address);
  // let { address, decimals, name, symbol, ready, usedBalance: poolBalance } = state.tokens[index];
  let { symbol, decimals } = state.helper.getTokenInfo(address);
  let balance = state.getBalance(address);
  let displayBalance = formatBalance(balance, decimals, 4);
  let token = isInput ? state.input : state.output;
  let { displayAmount, errorMessage, amount } = token;

  let updateBalance = () => dispatch({ type: 'UPDATE_POOL' });

  let setAmount = (amount: string) => {
    if (isInput) {
      dispatch({ type: 'SET_INPUT_AMOUNT', amount });
    } else {
      dispatch({ type: 'SET_OUTPUT_AMOUNT', amount });
    }
  }

  let setAmountToBalance;
  if (isInput){
    setAmountToBalance = () => dispatch({ type: 'SET_INPUT_EXACT', amount: balance });
  } else {
    setAmountToBalance = () => dispatch({ type: 'SET_OUTPUT_AMOUNT', amount: displayBalance });
  }

  let bindInput = {
    value: displayAmount,
    name: symbol,
    onChange: (event) => {
      event.preventDefault();
      let value = event.target.value;
      if (value === displayAmount) return;
      setAmount(value.toString());
    }
  };

  return {
    address,
    decimals,
    symbol,
    displayAmount,
    errorMessage,
    isInput,
    setAmountToBalance,
    bindInput,
    displayBalance,
    updateBalance,
    target: state.poolAddress
  }
}

export type SwapContextType = {
  useInput: () => TokenActions;
  useOutput: () => TokenActions;
  swapState: SwapState;
  setHelper: (pool: PoolHelper) => void;
  updatePool: (clearInputs?: boolean) => void;
  selectToken: (index: number) => void;
  switchTokens: () => void;
}

export function useSwap(): SwapContextType {
  const [ swapState, swapDispatch ] = useReducer(swapReducer, initialState);
  const dispatch = withTradeMiddleware(swapState, swapDispatch);
  const selectToken = (index: number) => dispatch({ type: 'SELECT_TOKEN', index });
  const updatePool = (clearInputs?: boolean) => dispatch({ type: 'UPDATE_POOL', clearInputs });
  const setHelper = (pool: PoolHelper ) => dispatch({ type: 'SET_HELPER', pool });
  const setTokens = (tokens: TokenList) => dispatch({ type: 'SET_TOKENS', tokens });
  
  return {
    useInput: () => useTradeTokenActions(swapState, dispatch, swapState.input.address),
    useOutput: () => useTradeTokenActions(swapState, dispatch, swapState.output.address),
    switchTokens: () => dispatch({ type: 'SWITCH_TOKENS' }),
    swapState,
    setHelper,
    updatePool,
    selectToken,
  };
}

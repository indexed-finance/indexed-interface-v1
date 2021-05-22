import { BigNumber, formatBalance, PoolHelper } from "@indexed-finance/indexed.js";
import Minter from '@indexed-finance/indexed.js/dist/minter';
import { MintParams } from "@indexed-finance/indexed.js/dist/minter/types";
import { useEffect, useReducer } from "react";
import { WETH, ZERO_ADDRESS } from "../../assets/constants/addresses";
import { whitelistTokens } from "../../assets/constants/parameters";
import useDebounce from "../../hooks/useDebounce";
import {
  SetSlippage,
  SetSpecifiedSide,
  UniswapMinterDispatchAction,
  UniswapMinterMiddlewareAction,
  SetInputToken,
  SetOutputToken,
  SetMinter,
  SetParams,
  SetLoading
} from "../actions/uniswap-minter-actions";
import { withUniswapMinterMiddleware } from "../middleware/uniswap-minter-middleware";

const BN_ZERO = new BigNumber(0);

export type UniswapMinterToken = {
  address: string;
  decimals: number;
  amount: BigNumber;
  displayAmount: string;
  errorMessage?: string;
}

export type TokenList = Array<{
  symbol: string,
  decimals: number,
  address: string,
 }>

export type UniswapMinterState = {
  pool?: PoolHelper;
  minter?: Minter;
  params?: MintParams;
  input: UniswapMinterToken;
  output: UniswapMinterToken;
  getBalance?: (address: string) => BigNumber;
  getAllowance?: (address: string) => BigNumber;
  specifiedSide?: 'output' | 'input';
  slippage: number;
  ready: boolean;
  poolAddress?: string;
  price: BigNumber;
  display: boolean;
  approvalNeeded: boolean;
  loading?: boolean;
  whitelist: TokenList;
};

const initialState: UniswapMinterState = {
  pool: undefined,
  slippage: 0,
  input: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: ''
  },
  output: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: ''
  },
  ready: false,
  price: BN_ZERO,
  display: false,
  approvalNeeded: false,
  loading: false,
  whitelist: whitelistTokens
};

const compareAddresses = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase();
}

function uniswapMinterReducer(
  state: UniswapMinterState = initialState,
  actions: UniswapMinterDispatchAction | UniswapMinterDispatchAction[]
): UniswapMinterState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: UniswapMinterState = { ...state };

  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.') || '0';

  function setInput(action: SetInputToken) {
    newState.input = action.token;
    newState.input.displayAmount = cleanInputAmount(action.token.displayAmount);
  }

  function setOutput(action: SetOutputToken) {
    newState.output = action.token;
    newState.output.displayAmount = cleanInputAmount(action.token.displayAmount);
  }

  function setMinter(action: SetMinter) {
    if(!action.pool) return;

    newState.pool = action.pool;
    newState.minter = action.minter;
    newState.whitelist = newState.whitelist.filter(t => !(newState.pool.tokens.find(pt => compareAddresses(t.address, pt.address))));
    if (!!action.pool.tokens.find(pt => compareAddresses(pt.address, WETH))) {
      newState.whitelist = newState.whitelist.filter(t => t.address !== `0x${'00'.repeat(20)}`)
    }
    newState.input = {
      ...newState.whitelist[0],
      amount: BN_ZERO,
      displayAmount: ''
    }
  }

  function setSide(action: SetSpecifiedSide){
    newState.specifiedSide = action.side;
  }

  const getBalance = (tokenAddress: string): BigNumber => {
    if (!newState.minter) return BN_ZERO;
    return newState.minter.userBalances[tokenAddress.toLowerCase()] || BN_ZERO;
  }

  const getAllowance = (tokenAddress: string): BigNumber => {
    if (!newState.minter) return BN_ZERO;
    return newState.minter.userAllowances[tokenAddress.toLowerCase()] || BN_ZERO;
  }

  const setSlippage = (action: SetSlippage) => {
    newState.slippage = action.slippage;
  }

  const toggleDisplay = () => {
    newState.display = !newState.display
  }

  const setParams = (action: SetParams) => {
    newState.params = action.params;
  }

  const setLoading = (action: SetLoading) => {
    newState.loading = action.loading;
  }

  for (let action of actions) {
    switch (action.type) {
      case 'SET_INPUT_TOKEN': { setInput(action); break; }
      case 'SET_OUTPUT_TOKEN': { setOutput(action); break; }
      case 'SET_SPECIFIED_SIDE': { setSide(action); break; }
      case 'SET_SLIPPAGE': { setSlippage(action); break; }
      case 'SET_MINTER': { setMinter(action); break; }
      case 'TOGGLE_DISPLAY': { toggleDisplay(); break; }
      case 'SET_PARAMS': { setParams(action); break; }
      case 'SET_LOADING': { setLoading(action); break; }
    }
  }

  let isReady = false;
  newState.approvalNeeded = false;

  if (newState.minter && newState.params) {
    isReady = true;
    newState.getAllowance = getAllowance;
    newState.getBalance = getBalance;
    newState.poolAddress = newState.pool.address;
    newState.approvalNeeded = false;
    let amount = newState.input.amount;
    if (amount.eq(0)) {
      isReady = false;
    } else {
      let balance = getBalance(newState.input.address);
      if (balance.lt(amount)) {
        isReady = false;
        newState.input.errorMessage = 'EXCEEDS BALANCE';
      }
      if (isReady && newState.input.address !== ZERO_ADDRESS) {
        let allowance = getAllowance(newState.input.address);
        if (allowance.lt(amount)) {
          isReady = false;
          newState.approvalNeeded = true;
        }
      }
    }
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

export function useMinterTokenActions(
  state: UniswapMinterState,
  dispatch: (action: UniswapMinterDispatchAction | UniswapMinterMiddlewareAction ) => Promise<void>,
  address: string
): TokenActions {
  let isInput = compareAddresses(address, state.input.address);

  let whitelistToken = whitelistTokens.find(i => compareAddresses(i.address, address));
  let { symbol, decimals } = whitelistToken || { decimals: 18 };

  let balance = (state.minter && state.minter.userAddress && state.minter.userBalances[address.toLowerCase()]) || BN_ZERO;
  //state.getBalance ? state.getBalance(address) : BN_ZERO;
  let displayBalance = formatBalance(balance, decimals, 4);
  let token = isInput ? state.input : state.output;
  let { displayAmount, errorMessage, amount } = token;

  let debouncedAmount = useDebounce(displayAmount, 500);
  useEffect(() => {
    dispatch({ type: 'UPDATE_PARAMS' })
  }, [debouncedAmount])

  let setAmount = (amount: string) => {
    if (!isInput) {
      if (amount == displayAmount) return;
      dispatch({ type: 'SET_OUTPUT_AMOUNT', amount });
    }
  }

  let setAmountToBalance = () => {};

  let bindInput = {
    value: displayAmount,
    name: symbol,
    disabled: isInput,

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
    updateBalance: () => dispatch({ type: 'UPDATE_POOL' }),
    target: state.poolAddress
  }
}

export type UniswapMinterContextType = {
  useInput: () => TokenActions;
  useOutput: () => TokenActions;
  minterState: UniswapMinterState;
  setHelper: (pool: PoolHelper) => void;
  updatePool: (clearInputs?: boolean) => void;
  selectToken: (index: number) => void;
  tokenList: TokenList;
  slippage: number;
  display: boolean;
  toggleDisplay: () => void;
  approvalNeeded: boolean;
  message: string;
  updateParams: () => void;
}

export function useUniswapMinter(): UniswapMinterContextType {
  const [ minterState, minterDispatch ] = useReducer(uniswapMinterReducer, initialState);
  const dispatch = withUniswapMinterMiddleware(minterState, minterDispatch);
  const selectToken = (index: number) => dispatch({ type: 'SELECT_TOKEN', index });
  const updatePool = (clearInputs?: boolean) => dispatch({ type: 'UPDATE_POOL', clearInputs });
  const setHelper = (pool: PoolHelper ) => dispatch({ type: 'SET_HELPER', pool });
  const toggleDisplay = () => dispatch({ type: 'TOGGLE_DISPLAY' });

  function updateParams() {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'UPDATE_PARAMS' });
  }

  const slippage = 0.01;

  let message: string = '';
  let mapPath = (path: string[]) => {
    let symbols = path.map(a => [
      ...(minterState.minter.inputTokens),
      ...(minterState.pool.tokens)
    ].find(t => compareAddresses(t.address, a)).symbol);
    return symbols;//.join(' -> ');
  }
  if (minterState.params) {
    let poolSymbol = minterState.pool.pool.symbol;
    if (!(+minterState.input.displayAmount)) {
      message = '';
    } else {
      switch (minterState.params.fn) {
        case 'swapTokensForTokensAndMintExact':
        case 'swapExactTokensForTokensAndMint':
        case 'swapETHForTokensAndMintExact':
        case 'swapExactETHForTokensAndMint': {
          let path = minterState.params.path;
          let symbols = mapPath(path);
          let finalToken = symbols[symbols.length - 1];
          message = [
            `Swap: ${symbols.join(' -> ')}`,
            `Mint: ${finalToken} -> ${poolSymbol}`
          ].join('\n');
          break;
        }
        default: {
          let {address} = minterState.input;
          let symbol = (address == ZERO_ADDRESS) ? 'ETH' : mapPath([address]);
          let pooltokens = minterState.pool.tokens.map(t => t.symbol).join(',');
          message = [
            `Swap: ${symbol} -> ${pooltokens}`,
            `Mint: All -> ${poolSymbol}`
          ].join('\n');
        }
      }
    }
  }

  return {
    useInput: () => useMinterTokenActions(minterState, dispatch, minterState.input.address),
    useOutput: () => useMinterTokenActions(minterState, dispatch, minterState.output.address),
    display: minterState.display,
    toggleDisplay,
    minterState,
    setHelper,
    updatePool,
    selectToken,
    tokenList: minterState.whitelist,
    slippage,
    approvalNeeded: minterState.approvalNeeded,
    message,
    updateParams
  };
}

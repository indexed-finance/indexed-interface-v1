import { BigNumber, toWei, formatBalance } from "@indexed-finance/indexed.js";
import { UniswapHelper, toBN } from '@indexed-finance/indexed.js';
import { useEffect, useReducer } from "react";
import { TradeMiddlewareAction, TradeDispatchAction, SetInputToken, SetOutputToken, SetUniswapHelper, SetSwitching } from "../actions/trade-actions";
import { withTradeMiddleware } from "../middleware/trade-middleware";
import useDebounce from "../../hooks/useDebounce";
import { UNISWAP_ROUTER } from '../../assets/constants/addresses';

const whitelist = {
  rinkeby: [
    { address: '0xc778417e063141139fce010982780140aa0cd5ab', symbol: 'ETH', decimals: 18 },
    { address: '0x5b36B53960Bc1f8b0cAb48AC51F47C8a03c65888', symbol: 'WBTC', decimals: 18 },
    { address: '0xea88bdf6917e7e001cb9450e8df08164d75c965e', symbol: 'DAI', decimals: 18 }
  ],
  mainnet: [
    { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'ETH', decimals: 18 },
  ]
};

const BN_ZERO = new BigNumber(0);

export type TradeToken = {
  address: string;
  decimals: number;
  amount: BigNumber;
  displayAmount: string;
  isPoolToken?: boolean;
  errorMessage?: string;
}

export type TradeState = {
  helper?: UniswapHelper;
  input: TradeToken;
  output: TradeToken;
  ethBalance: BigNumber;
  getBalance?: (address: string) => BigNumber;
  getAllowanceForPair?: (address: string) => BigNumber;
  ready: boolean;
  pairAddress?: string;
  price: BigNumber;
  side: 'input' | 'output';
  isSwitching: boolean;
};

const initialState: TradeState = {
  helper: undefined,
  ethBalance: BN_ZERO,
  input: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: '0',
    isPoolToken: true
  },
  output: {
    address: '',
    decimals: 18,
    amount: BN_ZERO,
    displayAmount: '0',
    isPoolToken: false
  },
  ready: false,
  price: BN_ZERO,
  side: 'input',
  isSwitching: false
};

const compareAddresses = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase();
}

function tradeReducer(state: TradeState = initialState, actions: TradeDispatchAction | TradeDispatchAction[]): TradeState {
  if (!(Array.isArray(actions))) {
    actions = [actions];
  }
  let newState: TradeState = { ...state };

  const cleanInputAmount = (amt: string) => amt.replace(/^(0{1,})(?=(0\.|\d))+/, '').replace(/^\./, '0.') || '0';

  function setInput(action: SetInputToken) {
    newState.input = action.token;
    newState.input.displayAmount = cleanInputAmount(action.token.displayAmount);
    newState.input.isPoolToken = compareAddresses(newState.input.address, newState.helper.tokenA.address);
  }

  function setOutput(action: SetOutputToken) {
    newState.output = action.token;
    newState.output.displayAmount = cleanInputAmount(action.token.displayAmount);
    newState.output.isPoolToken = compareAddresses(newState.output.address, newState.helper.tokenA.address);
  }

  function setHelper(action: SetUniswapHelper) {
    newState.helper = action.helper;
  }

  function setSwitching(action: SetSwitching) {
    newState.isSwitching = action.switching;
  }

  const getBalance = (tokenAddress: string): BigNumber => {
     if(tokenAddress == process.env.REACT_APP_WETH){
      return newState.helper.ethBalance || BN_ZERO;
    } else if (compareAddresses(newState.helper.tokenA.address, tokenAddress)) {
      return newState.helper.tokenABalance || BN_ZERO;
    }

    const pair = newState.helper.getPairForToken(tokenAddress);
    return pair.balanceB || BN_ZERO;
  }

  const getAllowanceForPair = (tokenAddress: string): BigNumber => {
    if(tokenAddress == process.env.REACT_APP_WETH) return new BigNumber(toWei(999999))

    const isInput = compareAddresses(tokenAddress, newState.input.address);
    const isPoolToken = isInput ? newState.input.isPoolToken : newState.output.isPoolToken;
    const otherToken = isInput ? newState.output.address : newState.input.address;
    const pair = isPoolToken ? newState.helper.getPairForToken(otherToken) : newState.helper.getPairForToken(tokenAddress);
    if (!pair) return BN_ZERO;
    if (isPoolToken) return pair.allowanceA || BN_ZERO;
    return pair.allowanceB || BN_ZERO;
  }

  const getReserves = (tokenAddress: string): BigNumber => {
    const isInput = compareAddresses(tokenAddress, newState.input.address);
    const isPoolToken = isInput ? newState.input.isPoolToken : newState.output.isPoolToken;
    const otherToken = isInput ? newState.output.address : newState.input.address;
    const pair = isPoolToken ? newState.helper.getPairForToken(otherToken) : newState.helper.getPairForToken(tokenAddress);
    if (!pair) return BN_ZERO;
    if (isPoolToken) return pair.reservesA || BN_ZERO;
    return pair.reservesB || BN_ZERO;
  }

  for (let action of actions) {
    switch (action.type) {
      case 'SET_INPUT_TOKEN': { setInput(action); break; }
      case 'SET_OUTPUT_TOKEN': { setOutput(action); break; }
      case 'SET_UNISWAP_HELPER': { setHelper(action); break; }
      case 'SET_PRICE': { newState.price = action.price; break; }
      case 'SET_SIDE': { newState.side = action.side; break; }
      case 'SET_SWITCHING': { setSwitching(action); break; }
    }
  }

  let isReady = false;

  if (newState.helper) {
    isReady = true;
    const checkInputToken = () => {
      const { address, amount } = newState.input;
      const balance = getBalance(address);
      const allowance = getAllowanceForPair(address);
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
      const reserves = getReserves(address);
      if (reserves.lt(amount)) {
        newState.output.errorMessage = 'EXCEEDS MAX OUT'
        isReady = false;
      } else {
        newState.output.errorMessage = '';
      }
    }
    checkInputToken();
    checkOutputToken();
    newState.getAllowanceForPair = getAllowanceForPair;
    newState.getBalance = getBalance;
    // newState.pairAddress = newState.input.isPoolToken
    //   ? newState.helper.getPairForToken(newState.output.address).pairAddress
    //   : newState.helper.getPairForToken(newState.input.address).pairAddress;
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
  isPoolToken: boolean;
  bindInput: {
    value: string;
    name: string;
    onChange: (event: Event) => void;
  },
  setAmountToBalance?: () => void;
  updateBalance: () => void;
  target?: string;
};

export function useTradeTokenActions(
  state: TradeState,
  dispatch: (action: TradeDispatchAction | TradeMiddlewareAction) => Promise<void>,
  address: string
): TokenActions {
  let isInput = compareAddresses(address, state.input.address);
  let isPoolToken = compareAddresses(address, state.helper.tokenA.address);
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


  let debouncedAmount = useDebounce(displayAmount, 500);
  useEffect(() => {
    dispatch({ type: 'UPDATE_PRICE' })
  }, [debouncedAmount])

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
    isPoolToken,
    setAmountToBalance,
    bindInput,
    displayBalance,
    updateBalance,
    target: UNISWAP_ROUTER
  }
}

export type TradeContextType = {
  useInput: () => TokenActions;
  useOutput: () => TokenActions;
  tradeState: TradeState;
  setHelper: (helper: UniswapHelper) => void;
  updatePool: (clearInputs?: boolean) => void;
  selectWhitelistToken: (index: number) => void;
  whitelistTokens: Array<{ symbol: string, decimals: number, address: string }>;
  switchTokens: () => void;
  priceString: string;
  feeString: string;
  usdRate: number;
  isWethPair: boolean;
  isSwitching: boolean;
}

export function useTrade(): TradeContextType {
  const [tradeState, tradeDispatch] = useReducer(tradeReducer, initialState);
  const dispatch = withTradeMiddleware(tradeState, tradeDispatch);
  const selectWhitelistToken = (index: number) => dispatch({ type: 'SELECT_WHITELIST_TOKEN', index });
  const updatePool = (clearInputs?: boolean) => dispatch({ type: 'UPDATE_POOL', clearInputs });
  const setHelper = (helper: UniswapHelper) => dispatch({ type: 'SET_UNISWAP_HELPER', helper });

  let price: string;
  let fee: string;
  let rate: number;
  let isEth: boolean;

  if (tradeState.helper) {
    let inputSymbol = tradeState.helper.getTokenInfo(tradeState.input.address).symbol;
    let outputSymbol = tradeState.helper.getTokenInfo(tradeState.output.address).symbol;
    let priceValue = formatBalance(tradeState.price, 0, 5)
    let isWethPair = inputSymbol === 'ETH'

    let usdRate = !isWethPair ? tradeState.price : toBN(1).div(tradeState.price)
    const { amount, decimals, address } = tradeState.input;
    fee = formatBalance(amount.times(3).div(1000), decimals, 4);
    price = `1 ${inputSymbol} = ${priceValue} ${outputSymbol}`

    rate = parseFloat(formatBalance(usdRate, 0, 5))
    fee = `${fee} ${inputSymbol}`;
    isEth = isWethPair
  }

  return {
    useInput: () => useTradeTokenActions(tradeState, dispatch, tradeState.input.address),
    useOutput: () => useTradeTokenActions(tradeState, dispatch, tradeState.output.address),
    switchTokens: () => dispatch({ type: 'SWITCH_TOKENS' }),
    tradeState,
    setHelper,
    updatePool,
    selectWhitelistToken,
    whitelistTokens: whitelist[process.env.REACT_APP_ETH_NETWORK],
    priceString: price || '',
    feeString: fee || '',
    usdRate: rate || 0,
    isWethPair: isEth,
    isSwitching: tradeState.isSwitching
  };
}

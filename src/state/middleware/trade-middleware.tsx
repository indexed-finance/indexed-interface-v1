import { BigNumber, formatBalance, toBN, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
import { withMiddleware } from ".";
import {
  TradeDispatch,
  TradeDispatchAction,
  TradeMiddlewareAction,
  SetInputExact,
  SetInputAmount,
  SetOutputAmount,
  SetUniswapHelper,
  SelectWhitelistToken, UpdateBalances
} from "../actions/trade-actions";
import { TradeState } from "../reducers/trade-reducer";

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

// function useUniswap({ metadata }) {
//   const poolToken = {
//     address: metadata.address,
//     symbol: metadata.symbol,
//     decimals: 18,
//   }
//   const { state } = useContext(store);
//   const [helper, setHelper] = useState(null);
//   const [inputAmount, setInputAmount] = useState({ exact: toBN(0), display: '0' });
//   const [outputAmount, setOutputAmount] = useState({ exact: toBN(0), display: '0' });
//   const [selectedInput, setSelectedInput] = useState(Object.assign(poolToken));
//   const [selectedOutput, setSelectedOutput] = useState(Object.assign(whitelist[0]));

//   useEffect(() => {
//     const setUniswapHelper = async () => {
//       const tokenA = {
//         address: metadata.address,
//         symbol: metadata.symbol,
//         decimals: 18
//       }
//       const uniHelper = new UniswapHelper(state.web3.injected, tokenA, whitelist, state.account);
//       setHelper(uniHelper);
//       await uniHelper.waitForUpdate;
//     }
//     if (state.web3.injected && !helper) {
//       setUniswapHelper();
//     }
//   }, [state.web3.injected]);

//   useEffect(() => {
//     const updateAddress = async () => {
//       helper.setUserAddress(state.account);
//       await helper.waitForUpdate;
//     }
//     if (helper && !helper.userAddress) {
//       updateAddress();
//     }
//   }, [state.account])

//   function switchTokens() {
//     const _output = Object.assign({}, inputAmount);
//     const _input = Object.assign({}, outputAmount);
//     const _tokenIn = selectedOutput;
//     const _tokenOut = selectedInput;
//     setOutputAmount(_output);
//     setInputAmount(_input);
//     setSelectedInput(_tokenIn);
//     setSelectedOutput(_tokenOut);
//   }



//   async function setInputValue(display) {
//     const exact = toTokenAmount(display, selectedInput.decimals);
//     setInputAmount({ exact, display });
//     const output = await helper.getAmountOut(selectedInput.address, selectedOutput.address, exact);
//     setOutputAmount({ display: output.displayAmount, exact: output.amount });
//   }

//   async function setOutputValue(display) {
//     const exact = toTokenAmount(display, selectedOutput.decimals);
//     setOutputAmount({ exact, display });
//     const input = await helper.getAmountIn(selectedInput.address, selectedOutput.address, exact);
//     setInputAmount({ display: input.displayAmount, exact: input.amount });
//   }



// }

type TradetDispatchType = (action: TradeMiddlewareAction | TradeDispatchAction) => Promise<void>;

export const withTradeMiddleware = (state: TradeState, dispatch: TradeDispatch): TradetDispatchType => withMiddleware(state, dispatch)(tradeMiddleware);

export const tradeMiddleware = (state: TradeState) => (next: TradeDispatch) => tradeDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function tradeDispatchMiddleware(dispatch: TradeDispatch, state: TradeState) {
  return (action: TradeMiddlewareAction | TradeDispatchAction): Promise<void> => {

    async function setInput(amount: BigNumber, displayAmount: string): Promise<void> {
      const input = { ...state.input };
      input.amount = amount;
      input.displayAmount = displayAmount;

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_SIDE', side: 'input' }
      ]);
    }

    async function updatePrice(): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };

      dispatch({ type: 'SET_SWITCHING', switching: true });

      if (state.side === 'input') {
        const outputAmount = await state.helper.getAmountOut(input.address, output.address, input.amount);
        output.amount = outputAmount.amount.times(0.99);
        output.displayAmount = formatBalance(output.amount, output.decimals, 4);

        let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
        let perciseInput = input.amount.div(toBN(10).pow(input.decimals));
        let price = perciseOutput.div(perciseInput);
        let notANumber = isNaN(parseFloat(formatBalance(price, 1, 4)));

        if(notANumber || input.amount.eq(0) || output.amount.eq(0)){
          const oneToken = toBN(10).pow(input.decimals);
          const standardRate = await state.helper.getAmountOut(input.address, output.address, oneToken);

          perciseOutput = toBN(standardRate.amount).div(toBN(10).pow(output.decimals));
          price = perciseOutput.div(toBN(1));
        }
        dispatch([
          { type: 'SET_SWITCHING', switching: false },
          { type: 'SET_OUTPUT_TOKEN', token: output },
          { type: 'SET_PRICE', price }
        ])
      } else {
        const inputAmount = await state.helper.getAmountIn(input.address, output.address, output.amount);

        input.amount = inputAmount.amount.lte(0) ? BN_ZERO : inputAmount.amount.times(1.01);
        input.displayAmount = inputAmount.amount.lte(0) ? '0.00' : formatBalance(input.amount, input.decimals, 4);
  
        let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
        let perciseInput = input.amount.div(toBN(10).pow(input.decimals));
        let price = perciseOutput.div(perciseInput);
        let notANumber = isNaN(parseFloat(formatBalance(price, 1, 4)));
  
        if(notANumber || input.amount.eq(0) || output.amount.eq(0)){
          const oneToken = toBN(10).pow(input.decimals);
          const standardRate = await state.helper.getAmountOut(input.address, output.address, oneToken);
  
          perciseOutput = toBN(standardRate.amount).div(toBN(10).pow(output.decimals));
          price = perciseOutput.div(toBN(1));
        }

        dispatch([
          { type: 'SET_SWITCHING', switching: false },
          { type: 'SET_INPUT_TOKEN', token: input },
          { type: 'SET_PRICE', price }
        ]);
      }
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const output = { ...state.output };
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);

      dispatch([
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_SIDE', side: 'output' }
      ]);
    }

    async function setInputAmount(action: SetInputAmount): Promise<void> {
      const { decimals } = state.input;
      const amount = toTokenAmount(action.amount, decimals);
      return setInput(amount, action.amount);
    }

    async function setInputExact(action: SetInputExact): Promise<void> {
      const { decimals } = state.input;
      const displayAmount = formatBalance(action.amount, decimals, 4)
      return setInput(action.amount, displayAmount);
    }

    async function switchTokens(): Promise<void> {
      if (!state.isSwitching) {
        let input = { ...state.output };
        let output = { ...state.input };

        let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
        let perciseInput = input.amount.div(toBN(10).pow(input.decimals));
        let price = perciseOutput.div(perciseInput);
        let notANumber = isNaN(parseFloat(formatBalance(price, 1, 4)));

        if (notANumber || input.amount.eq(0) || output.amount.eq(0)) {
          price = toBN(1).div(state.price);
        }

        dispatch([
          { type: 'SET_SWITCHING', switching: true },
          { type: 'SET_INPUT_TOKEN', token: input },
          { type: 'SET_OUTPUT_TOKEN', token: output },
          { type: 'SET_PRICE', price }
        ]);

        setTimeout(() => {
          dispatch({ type: 'SET_SWITCHING', switching: false });
        }, 2000)
      }
    }

    async function setHelper(action: SetUniswapHelper): Promise<void> {
      await action.helper.waitForUpdate;

      const { address, decimals } = action.helper.tokenA;
      const output = {
        amount: BN_ZERO,
        displayAmount: '0',
        address,
        decimals,
        isPoolToken: true
      };
      const wl0 = whitelist[process.env.REACT_APP_ETH_NETWORK][0];
      const input = {
        address: wl0.address,
        decimals: wl0.decimals,
        amount: BN_ZERO,
        displayAmount: '0',
        isPoolToken: false
      };

      let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
      let perciseInput = input.amount.div(toBN(10).pow(input.decimals));
      let price = perciseOutput.div(perciseInput);
      let notANumber = isNaN(parseFloat(formatBalance(price, 1, 4)));

      if(notANumber || input.amount.eq(0) || output.amount.eq(0)){
        const oneToken = toBN(10).pow(input.decimals);
        const standardRate = await action.helper.getAmountOut(input.address, output.address, oneToken);

        perciseOutput = toBN(standardRate.amount).div(toBN(10).pow(output.decimals));
        price = perciseOutput.div(toBN(1));
      }

      dispatch([
        { type: 'SET_UNISWAP_HELPER', helper: action.helper },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price }
      ]);
    }

    async function selectWhitelistToken(action: SelectWhitelistToken): Promise<void> {
      const { index } = action;
      const wlToken = whitelist[process.env.REACT_APP_ETH_NETWORK][index];
      const newToken = {
        address: wlToken.address,
        decimals: wlToken.decimals,
        isPoolToken: false
      }

      if (state.input.isPoolToken) {
        const { amount, address, decimals } = state.input;
        const outputAmount = await state.helper.getAmountOut(address, wlToken.address, amount);

        let perciseOutput = outputAmount.amount.div(toBN(10).pow(wlToken.deciamls));
        let perciseInput = amount.div(toBN(10).pow(decimals));
        let price = perciseOutput.div(perciseInput);
        let notANumber = isNaN(parseFloat(formatBalance(price, 1, 4)));

        if(amount.eq(0) || outputAmount.amount.eq(0)){
          const oneToken = toBN(10).pow(decimals);
          const standardRate = await state.helper.getAmountOut(address, wlToken.address, oneToken);

          perciseOutput = toBN(standardRate.amount).div(toBN(10).pow(wlToken.decimals));
          price = perciseOutput.div(toBN(1));
        }

        dispatch([
          { type: 'SET_OUTPUT_TOKEN', token: { ...newToken, ...outputAmount } },
          { type: 'SET_PRICE', price }
        ])
      } else {
        const { amount, address, decimals } = state.output;
        const inputAmount = await state.helper.getAmountIn(wlToken.address, address, amount);

        let perciseInput = inputAmount.amount.div(toBN(10).pow(wlToken.decimals));
        let perciseOutput = amount.div(toBN(10).pow(decimals));
        let price = perciseOutput.div(perciseInput);

        if(amount.eq(0) || inputAmount.amount.eq(0)){
          const oneToken = toBN(10).pow(wlToken.decimals);
          const standardRate = await state.helper.getAmountOut(wlToken.address, address, oneToken);

          perciseOutput = toBN(standardRate.amount).div(toBN(10).pow(decimals));
          price = perciseOutput.div(toBN(1));
        }

        dispatch([
          { type: 'SET_INPUT_TOKEN', token: { ...newToken, ...inputAmount } },
          { type: 'SET_PRICE', price }
        ]);
      }
    }

    const updatePool = async (action: UpdateBalances): Promise<void> => {
      await state.helper.update();
      let input = { ...state.input };
      let output = { ...state.output };
      if (action.clearInputs) {
        input = { ...input, amount: BN_ZERO, displayAmount: '0' }
        output = { ...output, amount: BN_ZERO, displayAmount: '0' }
      }
      return dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output }
      ]);
    }

    const fallback = async (action: TradeDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_INPUT_AMOUNT': return setInputAmount(action);
      case 'SET_INPUT_EXACT': return setInputExact(action);
      case 'SET_OUTPUT_AMOUNT': return setOutputAmount(action);
      case 'SWITCH_TOKENS': return switchTokens();
      case 'SET_UNISWAP_HELPER': return setHelper(action);
      case 'UPDATE_POOL': return updatePool(action);
      case 'SELECT_WHITELIST_TOKEN': return selectWhitelistToken(action);
      case 'UPDATE_PRICE': return updatePrice();
      default: return fallback(action);
    }
  }
}

import { BigNumber, formatBalance, toBN, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
import { calcSpotPrice } from "@indexed-finance/indexed.js/dist/bmath";
import { withMiddleware } from ".";
import {
  SwapDispatch,
  SwapDispatchAction,
  SwapMiddlewareAction,
  SetInputExact,
  SetInputAmount,
  SetOutputs,
  SelectOutput,
  SetOutputAmount,
  SetHelper,
  SelectToken,
  UpdateBalances,
  SetTokens,
} from "../actions/swap-actions";
import { SwapState } from "../reducers/swap-reducer";

type SwapDispatchType = (action: SwapMiddlewareAction | SwapDispatchAction) => Promise<void>;

export const withSwapMiddleware = (state: SwapState, dispatch: SwapDispatch): SwapDispatchType => withMiddleware(state, dispatch)(swapMiddleware);

export const swapMiddleware = (state: SwapState) => (next: SwapDispatch) => swapDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function swapDispatchMiddleware(dispatch: SwapDispatch, state: SwapState) {
  return (action: SwapMiddlewareAction | SwapDispatchAction ): Promise<void> => {
    const { pool } = state;

    async function setInput(amount: BigNumber, displayAmount: string): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };
      const { usedBalance } = pool.tokens.find(i => i.address == input.address);
      let isError = false;

      input.displayAmount = displayAmount;
      input.amount = amount;

      if(amount.lte(usedBalance.div(2))) {
        const outputValue = await state.pool.calcOutGivenIn(input.address, output.address, input.amount);

        output.amount = toBN(outputValue.amount)
        output.displayAmount = outputValue.displayAmount;
      } else {
        isError = true;
      }

      const perciseInput = parseFloat(formatBalance(input.amount, input.decimals, 4));
      const perciseOutput = parseFloat(formatBalance(output.amount, output.decimals, 4));
      let price = (perciseOutput/perciseInput).toFixed(4);

      if(isError || input.amount.eq(0) || input.amount.eq(output.amount)){
        let { amount } = await state.pool.calcOutGivenIn(input.address, output.address, toWei(1))
        const newPercise = parseFloat(formatBalance(toBN(amount), output.decimals, 4));
        price = (newPercise/1).toFixed(4);
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price }
      ]);
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);
      const { usedBalance } = pool.tokens.find(i => i.address == output.address);
      let isError = false;

      if (output.amount.lte(usedBalance.div(3))) {
        const inputValue = await state.pool.calcInGivenOut(input.address, output.address, output.amount);

        input.amount = toBN(inputValue.amount);
        input.displayAmount = inputValue.displayAmount;
      } else {
        isError = true;
      }

      const perciseInput = parseFloat(formatBalance(input.amount, input.decimals, 4));
      const perciseOutput = parseFloat(formatBalance(output.amount, output.decimals, 4));
      let price = (perciseOutput/perciseInput).toFixed(4);

      if(isError || input.amount.eq(0) || input.amount.eq(output.amount)){
         let { amount } = await state.pool.calcOutGivenIn(input.address, output.address, toWei(1))
         const newPercise = parseFloat(formatBalance(toBN(amount), output.decimals, 4));
         price = (newPercise/1).toFixed(4);
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price }
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
      let input = { ...state.output };
      let output = { ...state.input };

      const outputList = state.tokenList.filter(i =>
        input.address.toLowerCase() !== i.address.toLowerCase()
        && i.pool === input.pool
      );

      const perciseInput = parseFloat(formatBalance(input.amount, input.decimals, 4));
      const perciseOutput = parseFloat(formatBalance(output.amount, output.decimals, 4));
      const { usedBalance: inputBalance } = pool.tokens.find(i => i.address == input.address);
      const { usedBalance: outputBalance } = pool.tokens.find(i => i.address == output.address);

      let price = (perciseOutput/perciseInput).toFixed(4);

      if(input.amount.eq(0) || input.amount.eq(output.amount)
        || input.amount.gt(inputBalance.div(2)) || output.amount.gt(outputBalance)){
         let { amount } = await state.pool.calcOutGivenIn(input.address, output.address, toWei(1))
         const newPercise = parseFloat(formatBalance(toBN(amount), output.decimals, 4));
         price = (newPercise/1).toFixed(4);
      }

      dispatch([
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price }
      ]);
    }

    async function setTokens(action: SetTokens): Promise<void> {
      const inputToken = action.tokens[0]
      const input = {
        address: inputToken.address,
        decimals: inputToken.decimals,
        displayAmount: '0.00',
        pool: inputToken.pool,
        amount: BN_ZERO
      }

      const outputList = action.tokens.filter(i =>
        inputToken.address.toLowerCase() !== i.address.toLowerCase()
        && i.pool === input.pool
      );

      const outputToken = outputList[0]
      const output = {
        address: outputToken.address,
        decimals: outputToken.decimals,
        displayAmount: '0.00',
        pool: outputToken.pool,
        amount: BN_ZERO
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_TOKENS', tokens: action.tokens },
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
      ]);
    }

    async function setHelper(action: SetHelper): Promise<void> {
      await action.pool.waitForUpdate;
      const inputAddress = state.input.address;
      const outputAddress = state.output.address;

      const { amount } = await action.pool.calcOutGivenIn(inputAddress, outputAddress, toWei(1))
      const newPercise = parseFloat(formatBalance(toBN(amount), state.output.decimals, 4));
      const price = (newPercise/1).toFixed(4);

      dispatch([
        { type: 'SET_HELPER', pool: action.pool },
        { type: 'SET_PRICE', price: price }
      ]);
    }

    async function selectOutput(action: SelectOutput): Promise<void> {
      const { index } = action;
      const wlToken = state.outputList[index];
      const input = { ...state.input };
      let isError = false;

      const newToken = {
        address: wlToken.address,
        decimals: wlToken.decimals,
        pool: wlToken.pool,
        displayAmount: state.output.displayAmount,
        amount: state.output.amount
      };

      const { usedBalance } = pool.tokens.find(i => i.address == input.address);

      if(input.amount.lte(usedBalance.div(2))){
        const data = await pool.calcOutGivenIn(input.address, newToken.address, input.amount);

        newToken.displayAmount = data.displayAmount;
        newToken.amount = toBN(data.amount);
      } else {
        isError = true;
      }

      const perciseInput = parseFloat(formatBalance(input.amount, input.decimals, 4));
      const perciseOutput = parseFloat(formatBalance(newToken.amount, newToken.decimals, 4));
      let price = (perciseOutput/perciseInput).toFixed(4);

      if(isError || input.amount.eq(0) || input.amount.eq(newToken.amount)){
         let { amount } = await state.pool.calcOutGivenIn(input.address, newToken.address, toWei(1))
         const newPercise = parseFloat(formatBalance(toBN(amount), newToken.decimals, 4));
         price = (newPercise/1).toFixed(4);
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_OUTPUT_TOKEN', token: newToken },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_PRICE', price: price }
      ]);
    }

    async function selectToken(action: SelectToken): Promise<void> {
      const { index } = action;
      const wlToken = state.tokenList[index];
      let newOutput = { ...state.output }
      const newToken = {
        address: wlToken.address,
        decimals: wlToken.decimals,
        pool: wlToken.pool,
        displayAmount: '0.00',
        amount: BN_ZERO
      }
      let isError = false;

      const outputList = state.tokenList.filter(i =>
          newToken.address.toLowerCase() !== i.address.toLowerCase()
          && i.pool === wlToken.pool
      );

      if(newOutput.address == newToken.address){
        newOutput = {
          address: outputList[0].address,
          decimals: outputList[0].decimals,
          pool: outputList[0].pool,
          displayAmount: state.output.displayAmount,
          amount: state.output.amount
        }
      }

      const { usedBalance } = pool.tokens.find(i => i.address == newOutput.address);

      if(newOutput.amount.lte(usedBalance.div(3))){
        const data = await pool.calcInGivenOut(newToken.address, newOutput.address, newOutput.amount);

        newToken.displayAmount = data.displayAmount;
        newToken.amount = toBN(data.amount);
      } else {
        isError = true;
      }

      const perciseInput = parseFloat(formatBalance(newToken.amount, newToken.decimals, 4));
      const perciseOutput = parseFloat(formatBalance(newOutput.amount, newOutput.decimals, 4));
      let price = (perciseOutput/perciseInput).toFixed(4);

      if(isError || newToken.amount.eq(0) || newToken.amount.eq(newOutput.amount)){
         let { amount } = await state.pool.calcOutGivenIn(newToken.address, newOutput.address, toWei(1))
         const newPercise = parseFloat(formatBalance(toBN(amount), newOutput.decimals, 4));
         price = (newPercise/1).toFixed(4);
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_INPUT_TOKEN', token: newToken },
        { type: 'SET_OUTPUT_TOKEN', token: newOutput },
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_PRICE', price: price }
      ])
    }

    const updatePool = async (action: UpdateBalances): Promise<void> => {
      await state.pool.update();
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

    const fallback = async (action: SwapDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_INPUT_AMOUNT': return setInputAmount(action);
      case 'SET_INPUT_EXACT': return setInputExact(action);
      case 'SET_OUTPUT_AMOUNT': return setOutputAmount(action);
      case 'SWITCH_TOKENS': return switchTokens();
      case 'SET_HELPER': return setHelper(action);
      case 'UPDATE_POOL': return updatePool(action);
      case 'SELECT_TOKEN': return selectToken(action);
      case 'SELECT_OUTPUT': return selectOutput(action);
      case 'SET_TOKENS': return setTokens(action);
      default: return fallback(action);
    }
  }
}

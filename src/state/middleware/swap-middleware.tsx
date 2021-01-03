import { BigNumber, formatBalance, toBN, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
import { TokenAmount } from '@indexed-finance/indexed.js/dist/pool-helper'
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
      let maxPrice: BigNumber;

      input.displayAmount = displayAmount;
      input.amount = amount;

      if(amount.lte(usedBalance.div(2))) {
        const outputValue = await state.pool.calcOutGivenIn(input.address, output.address, input.amount);
        maxPrice = outputValue.spotPriceAfter.times(1.02);
        output.amount = toBN(outputValue.amount)
        output.displayAmount = outputValue.displayAmount;
      } else {
        isError = true;
        maxPrice = BN_ZERO;
      }

      const perciseInput = input.amount.div(toBN(10).pow(input.decimals));
      let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
      let price = perciseOutput.div(perciseInput);

      if(isError || output.amount.eq(0) || input.amount.eq(0)){
        const oneToken = toBN(10).pow(input.decimals);
        const { amount } = await pool.calcOutGivenIn(input.address, output.address, oneToken)

        perciseOutput = toBN(amount).div(toBN(10).pow(output.decimals));
        price = perciseOutput.div(toBN(1));
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price },
        { type: 'SET_MAX_PRICE', price: maxPrice }
      ]);
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);
      const { usedBalance } = pool.tokens.find(i => i.address == output.address);
      let isError = false;
      let maxPrice: BigNumber;

      if (output.amount.lte(usedBalance.div(3))) {
        const inputValue = await state.pool.calcInGivenOut(input.address, output.address, output.amount);

        input.amount = toBN(inputValue.amount);
        input.displayAmount = inputValue.displayAmount;
        maxPrice = inputValue.spotPriceAfter.times(1.02)
      } else {
        isError = true;
        maxPrice = BN_ZERO;
      }

      const perciseInput = input.amount.div(toBN(10).pow(input.decimals));
      let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
      let price = perciseOutput.div(perciseInput);

      if(isError || output.amount.eq(0) || input.amount.eq(0)){
        const oneToken = toBN(10).pow(input.decimals);
        const { amount } = await pool.calcOutGivenIn(input.address, output.address, oneToken)

        perciseOutput = toBN(amount).div(toBN(10).pow(output.decimals));
        price = perciseOutput.div(toBN(1));
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price },
        { type: 'SET_MAX_PRICE', price: maxPrice }
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
      let quote: TokenAmount;
      let isError = false;

      const outputList = state.tokenList.filter(i =>
        input.address.toLowerCase() !== i.address.toLowerCase()
        && i.pool === input.pool
      );
      const { usedBalance } = pool.tokens.find(i => i.address == input.address);

      if (input.amount.lte(usedBalance.div(2))) {
        quote = await state.pool.calcOutGivenIn(input.address, output.address, input.amount);

        output.displayAmount = quote.displayAmount;
        output.amount = toBN(quote.amount);
      } else {
        isError = true;
      }

      const perciseInput = input.amount.div(toBN(10).pow(input.decimals));
      let perciseOutput = output.amount.div(toBN(10).pow(output.decimals));
      let price = perciseOutput.div(perciseInput);

      if(isError || output.amount.eq(0) || input.amount.eq(0)){
        const oneToken = toBN(10).pow(input.decimals);
        const { amount } = await pool.calcOutGivenIn(input.address, output.address, oneToken)

        perciseOutput = toBN(amount).div(toBN(10).pow(output.decimals));
        price = perciseOutput.div(toBN(1));
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

      let price = toBN(0);
      if (state.pool) {
        const oneToken = toBN(10).pow(state.input.decimals);
        const { amount } = await state.pool.calcOutGivenIn(input.address, output.address, oneToken)
        const perciseOutput = toBN(amount).div(toBN(10).pow(state.output.decimals));
        price = perciseOutput.div(toBN(1));
      }

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_TOKENS', tokens: action.tokens },
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: price }
      ]);
    }

    async function setHelper(action: SetHelper): Promise<void> {
      await action.pool.waitForUpdate;
      const tokens = action.pool.tokens.map(({ symbol, decimals, address }) => ({ symbol, decimals, address, pool: action.pool.address }));
      const inputToken = tokens[0]
      const input = {
        address: inputToken.address,
        decimals: inputToken.decimals,
        displayAmount: '0.00',
        pool: inputToken.pool,
        amount: BN_ZERO
      }

      const outputList = tokens.filter(i =>
        inputToken.address.toLowerCase() !== i.address.toLowerCase()
      );

      const outputToken = outputList[0]
      const output = {
        address: outputToken.address,
        decimals: outputToken.decimals,
        displayAmount: '0.00',
        pool: outputToken.pool,
        amount: BN_ZERO
      }

      let price = toBN(0);
      if (state.pool) {
        const oneToken = toBN(10).pow(state.input.decimals);
        const { amount } = await state.pool.calcOutGivenIn(input.address, output.address, oneToken)
        const perciseOutput = toBN(amount).div(toBN(10).pow(state.output.decimals));
        price = perciseOutput.div(toBN(1));
      }

      dispatch([
        { type: 'SET_HELPER', pool: action.pool },
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_TOKENS', tokens: tokens },
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
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

      const perciseInput = input.amount.div(toBN(10).pow(input.decimals));
      let perciseOutput = newToken.amount.div(toBN(10).pow(newToken.decimals));
      let price = perciseOutput.div(perciseInput);

      if(isError || newToken.amount.eq(0) || input.amount.eq(0)){
        const oneToken = toBN(10).pow(input.decimals);
        const { amount } = await pool.calcOutGivenIn(input.address, newToken.address, oneToken)

        perciseOutput = toBN(amount).div(toBN(10).pow(newToken.decimals));
        price = perciseOutput.div(toBN(1));
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

      const perciseInput = newToken.amount.div(toBN(10).pow(newToken.decimals));
      let perciseOutput = newOutput.amount.div(toBN(10).pow(newOutput.decimals));
      let price = perciseOutput.div(perciseInput);

      if(isError || newToken.amount.eq(0) || newOutput.amount.eq(0)){
        const oneToken = toBN(10).pow(newToken.decimals);
        const { amount } = await pool.calcOutGivenIn(newToken.address, newOutput.address, oneToken)

        perciseOutput = toBN(amount).div(toBN(10).pow(newOutput.decimals));
        price = perciseOutput.div(toBN(1));
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

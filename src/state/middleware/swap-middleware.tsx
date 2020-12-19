import { BigNumber, formatBalance, toBN, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
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
      input.displayAmount = displayAmount;
      input.amount = amount;

      const { usedBalance: poolBalance } = pool.tokens.find(i => i.address == input.address )

      let inputAmount;
      if (amount.gt(poolBalance.div(2))) {
        inputAmount = poolBalance.div(2);
      } else {
        inputAmount = input.amount;
      }

      const data = await pool.calcOutGivenIn(input.address, output.address, inputAmount);
      const { displayAmount: pricing } = await pool.calcOutGivenIn(input.address, output.address, toWei(1));

      output.amount = toBN(data.amount);
      output.displayAmount = data.displayAmount;

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: pricing }
      ]);
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);

      const { usedBalance: poolBalance } = pool.tokens.find(i => i.address == output.address )

      let outputAmount;
      if (output.amount.gt(poolBalance.div(2))) {
        outputAmount = poolBalance.div(2);
      } else {
        outputAmount = output.amount;
      }

      const data = await pool.calcInGivenOut(output.address, input.address, outputAmount);
      const { displayAmount: pricing } = await pool.calcOutGivenIn(input.address, output.address, toWei(1));

      input.amount = toBN(data.amount);
      input.displayAmount = data.displayAmount;

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: pricing }
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

      const { displayAmount: pricing } = await pool.calcOutGivenIn(input.address, output.address, toWei(1));

      dispatch([
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: pricing }
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

      const outputToken = outputList[1]
      const output = {
        address: outputToken.address,
        decimals: outputToken.decimals,
        displayAmount: '0.00',
        pool: outputToken.pool,
        amount: BN_ZERO
      }

      dispatch([
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

      const { displayAmount: pricing } = await action.pool.calcOutGivenIn(inputAddress, outputAddress, toWei(1));

      dispatch([
        { type: 'SET_HELPER', pool: action.pool },
        { type: 'SET_PRICE', price: pricing }
      ]);
    }

    async function selectOutput(action: SelectOutput): Promise<void> {
      const { index } = action;
      const wlToken = state.outputList[index];
      const input = { ...state.input };

      const newToken = {
        address: wlToken.address,
        decimals: wlToken.decimals,
        pool: wlToken.pool,
        displayAmount: state.output.displayAmount,
        amount: state.output.amount
      }

      const data = await pool.calcInGivenOut(newToken.address, input.address, newToken.amount);
      const { displayAmount: pricing } = await pool.calcOutGivenIn(input.address, newToken.address, toWei(1));

      input.displayAmount = data.displayAmount;
      input.amount = toBN(data.amount);

      dispatch([
        { type: 'SET_OUTPUT_TOKEN', token: newToken },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_PRICE', price: pricing }
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
        displayAmount: state.input.displayAmount,
        amount: state.input.amount
      }
      const outputList = state.tokenList.filter(i =>
          wlToken.address.toLowerCase() !== i.address.toLowerCase()
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

      const data = await pool.calcOutGivenIn(newToken.address, newOutput.address, newToken.amount);
      const { displayAmount: pricing } = await pool.calcOutGivenIn(newToken.address, newOutput.address, toWei(1));

      newOutput.amount = toBN(data.amount);
      newOutput.displayAmount = data.displayAmount;

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: newToken },
        { type: 'SET_OUTPUT_TOKEN', token: newOutput },
        { type: 'SET_OUTPUTS', tokens: outputList },
        { type: 'SET_PRICE', price: pricing }
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

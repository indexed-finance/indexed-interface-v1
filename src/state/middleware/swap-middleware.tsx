import { BigNumber, formatBalance, toBN, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
import { withMiddleware } from ".";
import {
  SwapDispatch,
  SwapDispatchAction,
  SwapMiddlewareAction,
  SetInputExact,
  SetInputAmount,
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

    async function setInput(amount: BigNumber, displayAmount: string): Promise<void> {
      const input = { ...state.input };
      input.displayAmount = displayAmount;
      input.amount = amount;

      const output = { ...state.output };

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: '0.00' }
      ]);
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const input = { ...state.input };
      const output = { ...state.output };
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: '0.00' }
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
      dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price: '0.00' }
      ]);
    }

    async function setTokens(action: SetTokens): Promise<void> {
      const inputToken = action.tokens[0]
      const input = {
        address: inputToken.address,
        decimals: inputToken.decimals,
        displayAmount: '0.00',
        amount: BN_ZERO
      }

      const outputToken = action.tokens[1]
      const output = {
        address: outputToken.address,
        decimals: outputToken.decimals,
        displayAmount: '0.00',
        amount: BN_ZERO
      }

      dispatch([
        { type: 'SET_TOKENS', tokens: action.tokens },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_PRICE', price:'0.00' }
      ]);
    }

    async function setHelper(action: SetHelper): Promise<void> {
      await action.pool.waitForUpdate;

      dispatch([
        { type: 'SET_HELPER', pool: action.pool },
        { type: 'SET_PRICE', price:'0.00' }
      ]);
    }

    async function selectToken(action: SelectToken): Promise<void> {
      const { index } = action;
      const wlToken = state.tokenList[index]
      const newToken = {
        address: wlToken.address,
        decimals: wlToken.decimals,
        displayAmount: '0.00',
        amount: BN_ZERO
      }

      dispatch([
        { type: 'SET_INPUT_TOKEN', token: { ...newToken } },
        { type: 'SET_PRICE', price: '0.00' }
      ]);
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
      case 'SET_TOKENS': return setTokens(action);
      default: return fallback(action);
    }
  }
}

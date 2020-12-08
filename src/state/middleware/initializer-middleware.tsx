import { BigNumber, formatBalance, toTokenAmount, toBN } from "@indexed-finance/indexed.js";
import { InitializerToken } from "@indexed-finance/indexed.js/dist/types";
import { withMiddleware } from ".";
import { MiddlewareAction, InitDispatch, InitDispatchAction, SetTokenInput, UpdatePool } from "../actions/initializer-actions";
import { InitializerState } from "../reducers/initializer-reducer";

/* state => next => action => */

type InitDispatchType = (action: MiddlewareAction | InitDispatchAction) => Promise<void>;

export const withInitMiddleware = (state: InitializerState, dispatch: InitDispatch): InitDispatchType => withMiddleware(state, dispatch)(initMiddleware);

export const initMiddleware = (state: InitializerState) => (next: InitDispatch) => initDispatchMiddleware(next, state);

function initDispatchMiddleware(dispatch: InitDispatch, state: InitializerState) {
  return (action: MiddlewareAction | InitDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const updatePool = async (action: UpdatePool) => {
      await pool.update();
      let newTokens: InitializerToken[] = [];
      let newAmounts: BigNumber[] = [];
      let displayAmounts: string[] = [];
      let newCredits: BigNumber[] = [];
      let finalValueEstimate = new BigNumber(0);
      let currentValue = new BigNumber(0);
      pool.tokens.forEach((token, i) => {
        const price = pool.tokenPrices[token.address.toLowerCase()];
        currentValue = currentValue.plus(price.times(token.balance));
        finalValueEstimate = finalValueEstimate.plus(price.times(token.targetBalance));
        newTokens.push(token);
        if (action.clearInputs) {
          newAmounts.push(toBN(0));
          displayAmounts.push('0');
          newCredits.push(toBN(0));
        } else {
          newAmounts.push(state.amounts[i]);
          displayAmounts.push(state.displayAmounts[i]);
          newCredits.push(state.creditEthPerToken[i]);
        }

      });
      // const prices = newTokens.map(t => pool.tokenPrices[t.address]);
      // const currentValues =
      dispatch({
        type: 'SET_ALL',
        tokens: newTokens,
        amounts: newAmounts,
        displayAmounts,
        credits: newCredits,
        currentValue,
        finalValueEstimate
      });
    };

    const setTokenExact = async ({ index, amount, displayAmount }: { index: number, amount: BigNumber, displayAmount?: string }): Promise<void> => {
      const credit = await pool.getExpectedCredit(tokens[index].address, amount);
      if (!displayAmount) displayAmount = formatBalance(amount, tokens[index].decimals, 4) || '0';

      dispatch({
        type: 'SET_TOKEN_AMOUNT',
        index,
        amount,
        displayAmount,
        credit: new BigNumber(credit.credit)
      });
    }

    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount || 0, decimals);
      setTokenExact({ index, amount: exactAmount, displayAmount: amount.toString() || '0' })
    };

    const fallback = async (action: InitDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'UPDATE_POOL': return updatePool(action);
      default: return fallback(action);
    }
  }
}

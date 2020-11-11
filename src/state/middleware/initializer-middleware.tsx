import { BigNumber, toTokenAmount } from "@indexed-finance/indexed.js";
import { InitializerToken } from "@indexed-finance/indexed.js/dist/types";
import { withMiddleware } from ".";
import { MiddlewareAction, InitDispatch, InitDispatchAction, SetTokenInput } from "../actions/initializer-actions";
import { InitializerState } from "../reducers/initializer-reducer";

/* state => next => action => */

type InitDispatchType = (action: MiddlewareAction | InitDispatchAction) => Promise<void>;

export const withInitMiddleware = (state: InitializerState, dispatch: InitDispatch): InitDispatchType => withMiddleware(state, dispatch)(initMiddleware);

export const initMiddleware = (state: InitializerState) => (next: InitDispatch) => initDispatchMiddleware(next, state);

function initDispatchMiddleware(dispatch: InitDispatch, state: InitializerState) {
  return (action: MiddlewareAction | InitDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const updatePool = async () => {
      await pool.update();
      let newTokens: InitializerToken[] = [];
      let newAmounts: BigNumber[] = [];
      let newCredits: BigNumber[] = [];
      pool.tokens.forEach((token, i) => {
        if (token.amountRemaining.eq(0)) return;
        newTokens.push(token);
        newAmounts.push(state.amounts[i]);
        newCredits.push(state.creditEthPerToken[i]);
      });
      dispatch({
        type: 'SET_ALL',
        tokens: newTokens,
        amounts: newAmounts,
        credits: newCredits
      });
    };

    const setTokenExact = async ({ index, amount }: { index: number, amount: BigNumber }): Promise<void> => {
      const credit = await pool.getExpectedCredit(tokens[index].address, amount);
      dispatch({
        type: 'SET_TOKEN_AMOUNT',
        index,
        amount,
        credit: new BigNumber(credit.credit)
      });
    }

    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      setTokenExact({ index, amount: exactAmount })
    };

    const fallback = async (action: InitDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'UPDATE_POOL': return updatePool();
      default: return fallback(action);
    }
  }
}

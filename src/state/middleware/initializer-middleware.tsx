import { BigNumber, formatBalance, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { withMiddleware } from ".";
import { MiddlewareAction, InitDispatch, InitDispatchAction, SetPoolOutput, SetTokenExact, SetTokenInput, ToggleToken } from "../actions/initializer-actions";
import { InitializerState } from "../reducers/initializer-reducer";

/* state => next => action => */

type InitDispatchType = (action: MiddlewareAction | InitDispatchAction) => Promise<void>;

export const withInitMiddleware = (state: InitializerState, dispatch: InitDispatch): InitDispatchType => withMiddleware(state, dispatch)(initMiddleware);

export const initMiddleware = (state: InitializerState) => (next: InitDispatch) => initDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function initDispatchMiddleware(dispatch: InitDispatch, state: InitializerState) {
  return (action: MiddlewareAction | InitDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const poolOutGivenSingleIn = async (asset: string, exactAmount: BigNumber, index: number): Promise<InitDispatchAction[]> => {
       const { address, decimals } = tokens[index];

      const { credit, displayCredit} = await pool.getExpectedCredit(asset, exactAmount);

      return [
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, balance: toBN(0), allowance: toBN(0) },
        { type: 'SET_POOL_OUTPUT', amount: toBN(credit), display: displayCredit }
      ];
    }

    const allInGivenPoolOut = async (addresses: string[], amounts: BigNumber[]): Promise<InitDispatchAction[]> => {
      const emptyArr = new Array(tokens.length).fill(BN_ZERO);
      const result = await pool.getExpectedCredits(addresses, amounts);
      const { displayCredit, credit } = result[0];
      const { selectedIndex } = state;
      const index = selectedIndex;
      const amount = amounts[index];

      return [
        { type: 'SET_ALL_AMOUNTS', amounts, balances: emptyArr, allowances: emptyArr },
        { type: 'SET_SINGLE_AMOUNT', index, amount, balance: toBN(0), allowance: toBN(0) },
        { type: 'SET_POOL_OUTPUT', amount: toBN(credit), display: displayCredit }
      ];
    }

    const setPoolOutput = async ({ amount }: SetPoolOutput): Promise<void> => {
      let displayCredit = formatBalance(amount, 18, 4)

      return dispatch({
        type: 'SET_POOL_OUTPUT', amount: toBN(amount), display: displayCredit
      })
    }

    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { isSingle, amounts, tokens } = state;
      const { address, decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      const addresses = tokens.map(i => i.address);
      const newInputs = amounts;

      newInputs[index] = exactAmount;

      if(isSingle) return dispatch(await poolOutGivenSingleIn(address, exactAmount, index));
      else return dispatch(await allInGivenPoolOut(addresses, newInputs));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {
      return dispatch(await poolOutGivenSingleIn(state.tokens[index].address, amount, index));
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex, amounts, tokens } = state;

      if (isSingle && action.index === selectedIndex) {
        const addresses = tokens.map(i => i.address);
        const actions = await allInGivenPoolOut(addresses, amounts);

        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const { address } = tokens[action.index];
        const amount = amounts[action.index];
        const actions = await poolOutGivenSingleIn(address, amount, action.index);
        const emptyArr = new Array(tokens.length).fill(BN_ZERO);

        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      }
    }

    const fallback = async (action: InitDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'TOGGLE_SELECT_TOKEN': return toggleToken(action);
      case 'SET_POOL_OUTPUT': return setPoolOutput(action);
      default: return fallback(action);
    }
  }
}

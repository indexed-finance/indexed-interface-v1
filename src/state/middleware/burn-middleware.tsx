import { BigNumber, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { withMiddleware } from ".";
import { MiddlewareAction, BurnDispatch, BurnDispatchAction, SetPoolInput, SetTokenExact, SetTokenOutput, ToggleToken, SetPoolExact } from "../actions/burn-actions";
import { BurnState } from "../reducers/burn-reducer";

/* state => next => action => */

type BurnDispatchType = (action: MiddlewareAction | BurnDispatchAction) => Promise<void>;

export const withBurnMiddleware = (state: BurnState, dispatch: BurnDispatch): BurnDispatchType => withMiddleware(state, dispatch)(burnMiddleware);

export const burnMiddleware = (state: BurnState) => (next: BurnDispatch) => burnDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function burnDispatchMiddleware(dispatch: BurnDispatch, state: BurnState) {
  return (action: MiddlewareAction | BurnDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const singleOutGivenPoolIn = async (poolAmountIn: BigNumber, index: number): Promise<BurnDispatchAction[]> => {
      const token = tokens[index];
      const result = await pool.calcSingleOutGivenPoolIn(token.address, poolAmountIn);
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return [
        { type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances: emptyArr, allowances: emptyArr },
        { type: 'SET_SINGLE_AMOUNT', index, amount: toBN(result.amount), balance: toBN(result.balance || 0), allowance: toBN(result.allowance || 0) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountIn) },
        { type: 'SET_SPECIFIED_SIDE', side: 'output' }
      ];
    };

    const poolInGivenSingleOut = async (address: string, exactAmount: BigNumber, index: number): Promise<BurnDispatchAction[]> => {
      const result = await pool.calcPoolInGivenSingleOut(address, exactAmount);
      const { amount: poolAmount, allowance, balance  } = result;
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return [
        { type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances: emptyArr, allowances: emptyArr },
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, balance: toBN(balance || 0), allowance: toBN(allowance || 0) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmount) },
        { type: 'SET_SPECIFIED_SIDE', side: 'input' }
      ];
    }

    const allOutGivenPoolIn = async (exactAmount: BigNumber): Promise<BurnDispatchAction[]> => {
      const result = await pool.calcAllOutGivenPoolIn(exactAmount);
      const { balances, allowances, amounts } = result.reduce((obj, { balance, allowance, amount }) => ({
        balances: [...obj.balances, toBN(balance || 0)],
        allowances: [...obj.allowances, toBN(allowance || 0)],
        amounts: [...obj.amounts, toBN(amount)]
      }), { balances: [], allowances: [], amounts: []});
      return [
        { type: 'SET_ALL_AMOUNTS', amounts, balances, allowances },
        { type: 'SET_POOL_AMOUNT', amount: toBN(exactAmount) },
        { type: 'SET_SPECIFIED_SIDE', side: 'output' }
      ];
    }

    const setPoolExact = async ({ amount }: SetPoolExact) => {
      const { isSingle, selectedIndex } = state;
      if (isSingle) {
        return dispatch(await singleOutGivenPoolIn(amount, selectedIndex));
      } else {
        return dispatch(await allOutGivenPoolIn(amount));
      }
    }

    const setTokenOutput = async ({ index, amount }: SetTokenOutput): Promise<void> => {
      const { address, decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      return dispatch(await poolInGivenSingleOut(address, exactAmount, index));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {      
      return dispatch(await poolInGivenSingleOut(state.tokens[index].address, amount, index));
    }

    const setPoolInput = async ({ amount }: SetPoolInput): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      const exactAmount = toTokenAmount(amount, 18);
      if (isSingle) {
        return dispatch(await singleOutGivenPoolIn(exactAmount, selectedIndex));
      } else {
        return dispatch(await allOutGivenPoolIn(exactAmount));
      }
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      if (isSingle && action.index === selectedIndex) {
        const actions = await allOutGivenPoolIn(state.poolAmountIn);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const actions = await singleOutGivenPoolIn(state.poolAmountIn, action.index);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      }
    }

    const updatePool = async (): Promise<void> => {
      await state.pool.update();
      const balances = tokens.map(t => toBN(state.pool.userBalances[t.address] || BN_ZERO))
      const allowances = tokens.map(t => toBN(state.pool.userAllowances[t.address] || BN_ZERO))
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return dispatch({ type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances, allowances });
    }

    const fallback = async (action: BurnDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_OUTPUT': return setTokenOutput(action);
      case 'SET_POOL_INPUT': return setPoolInput(action);
      case 'TOGGLE_SELECT_TOKEN': return toggleToken(action);
      case 'SET_POOL_EXACT': return setPoolExact(action);
      case 'UPDATE_POOL': return updatePool();
      default: return fallback(action);
    }
  }
}

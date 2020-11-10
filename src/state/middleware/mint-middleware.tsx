import { BigNumber, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { MiddlewareAction, MintDispatch, MintDispatchAction, SetPoolOutput, SetTokenExact, SetTokenInput, ToggleToken } from "../actions/mint-actions";
import { MintState } from "../reducers/mint-reducer";

/* state => next => action => */

export const mintMiddleware = (state: MintState) => (next: MintDispatch) => mintDispatchMiddleware(next, state);

function mintDispatchMiddleware(dispatch: MintDispatch, state: MintState) {
  return (action: MiddlewareAction | MintDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const singleInGivenPoolOut = async (poolAmountOut: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      const token = tokens[index];
      const result = await pool.calcSingleInGivenPoolOut(token.address, poolAmountOut);
      return [
        { type: 'SET_SINGLE_AMOUNT', index, amount: toBN(result.amount), balance: toBN(result.balance), allowance: toBN(result.allowance) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountOut) }
      ];
    };

    const poolOutGivenSingleIn = async (address: string, exactAmount: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      // const { address, decimals } = tokens[index];
      // const exactAmount = toTokenAmount(tokenAmountIn, decimals);
      const result = await pool.calcPoolOutGivenSingleIn(address, exactAmount);
      const { amount: poolAmount, allowance, balance  } = result;
      return [
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, balance: toBN(balance), allowance: toBN(allowance) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmount) }
      ];
    }

    const allInGivenPoolOut = async (exactAmount: BigNumber): Promise<MintDispatchAction[]> => {
      const result = await pool.calcAllInGivenPoolOut(exactAmount);
      const { balances, allowances, amounts } = result.reduce((obj, { balance, allowance, amount }) => ({
        balances: [...obj.balances, toBN(balance)],
        allowances: [...obj.allowances, toBN(allowance)],
        amounts: [...obj.amounts, toBN(amount)]
      }), { balances: [], allowances: [], amounts: []});
      return [
        { type: 'SET_ALL_AMOUNTS', amounts, balances, allowances },
        { type: 'SET_POOL_AMOUNT', amount: toBN(exactAmount) }
      ];
    }
    
    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { address, decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      return dispatch(await poolOutGivenSingleIn(address, exactAmount, index));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {
      return dispatch(await poolOutGivenSingleIn(state.tokens[index].address, amount, index));
    }

    const setPoolOutput = async ({ amount }: SetPoolOutput): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      const exactAmount = toTokenAmount(amount, 18);
      if (isSingle) {
        return dispatch(await singleInGivenPoolOut(exactAmount, selectedIndex));
      } else {
        return dispatch(await allInGivenPoolOut(exactAmount));
      }
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      if (isSingle && action.index === selectedIndex) {
        const actions = await allInGivenPoolOut(state.poolAmountOut);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const actions = await singleInGivenPoolOut(state.poolAmountOut, action.index);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      }
    }

    const fallback = async (action: MintDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'SET_POOL_OUTPUT': return setPoolOutput(action);
      case 'TOGGLE_SELECT_TOKEN': return toggleToken(action);
      default: return fallback(action);
    }
  }
}
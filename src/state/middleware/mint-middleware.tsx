import { BigNumber, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { MiddlewareAction, MintDispatch, MintDispatchAction, SetPoolOutput, SetTokenExact, SetTokenInput, ToggleToken } from "../actions/mint-actions";
import { MintState } from "../reducers/mint-reducer";

/* state => next => action => */

export const mintMiddleware = (state: MintState) => (next: MintDispatch) => mintDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function mintDispatchMiddleware(dispatch: MintDispatch, state: MintState) {
  return (action: MiddlewareAction | MintDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const singleInGivenPoolOut = async (poolAmountOut: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      const token = tokens[index];
      const result = await pool.calcSingleInGivenPoolOut(token.address, poolAmountOut);
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return [
        { type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances: emptyArr, allowances: emptyArr },
        { type: 'SET_SINGLE_AMOUNT', index, amount: toBN(result.amount), balance: toBN(result.balance || 0), allowance: toBN(result.allowance || 0) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountOut) },
        { type: 'SET_SPECIFIED_SIDE', side: 'output' }
      ];
    };

    const poolOutGivenSingleIn = async (address: string, exactAmount: BigNumber, index: number): Promise<MintDispatchAction[]> => {
      const result = await pool.calcPoolOutGivenSingleIn(address, exactAmount);
      const { amount: poolAmount, allowance, balance  } = result;
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return [
        { type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances: emptyArr, allowances: emptyArr },
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, balance: toBN(balance || 0), allowance: toBN(allowance || 0) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmount) },
        { type: 'SET_SPECIFIED_SIDE', side: 'input' }
      ];
    }

    const allInGivenPoolOut = async (exactAmount: BigNumber): Promise<MintDispatchAction[]> => {
      const result = await pool.calcAllInGivenPoolOut(exactAmount);
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

    const updatePool = async (): Promise<void> => {
      await state.pool.update();
      const balances = tokens.map(t => toBN(state.pool.userBalances[t.address] || BN_ZERO))
      const allowances = tokens.map(t => toBN(state.pool.userAllowances[t.address] || BN_ZERO))
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return dispatch({ type: 'SET_ALL_AMOUNTS', amounts: emptyArr, balances, allowances });
    }

    const fallback = async (action: MintDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_TOKEN_EXACT': return setTokenExact(action);
      case 'SET_TOKEN_INPUT': return setTokenInput(action);
      case 'SET_POOL_OUTPUT': return setPoolOutput(action);
      case 'TOGGLE_SELECT_TOKEN': return toggleToken(action);
      case 'UPDATE_POOL': return updatePool();
      default: return fallback(action);
    }
  }
}
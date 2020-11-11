import { BigNumber, formatBalance, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
import { withMiddleware } from ".";
import { MiddlewareAction, MintDispatch, MintDispatchAction, SetPoolOutput, SetTokenExact, SetTokenInput, ToggleToken } from "../actions/mint-actions";
import { MintState } from "../reducers/mint-reducer";

type MintDispatchType = (action: MiddlewareAction | MintDispatchAction) => Promise<void>;

export const withMintMiddleware = (state: MintState, dispatch: MintDispatch): MintDispatchType => withMiddleware(state, dispatch)(mintMiddleware);

export const mintMiddleware = (state: MintState) => (next: MintDispatch) => mintDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function mintDispatchMiddleware(dispatch: MintDispatch, state: MintState) {
  return (action: MiddlewareAction | MintDispatchAction): Promise<void> => {
    const { pool, tokens } = state;

    const singleInGivenPoolOut = async (poolAmountOut: BigNumber, displayAmount: string, index: number): Promise<MintDispatchAction[]> => {
      const token = tokens[index];
      const result = await pool.calcSingleInGivenPoolOut(token.address, poolAmountOut);
      const amount = toBN(result.amount);
      const balance = toBN(result.balance || 0);
      const allowance = toBN(result.allowance || 0);
      return [
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'CLEAR_ALL_AMOUNTS' },
        { type: 'SET_SINGLE_AMOUNT', index, amount, displayAmount: formatBalance(amount, token.decimals, 4), balance, allowance },
        { type: 'SET_POOL_AMOUNT', amount: poolAmountOut, displayAmount }
      ];
    };

    const poolOutGivenSingleIn = async (address: string, amount: BigNumber, displayAmount: string, index: number): Promise<MintDispatchAction[]> => {
      const result = await pool.calcPoolOutGivenSingleIn(address, amount);
      const { amount: poolAmount, allowance, balance  } = result;
      const poolAmountOut = toBN(poolAmount)
      const poolDisplayAmount = formatBalance(poolAmountOut, 18, 4);
      return [
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'CLEAR_ALL_AMOUNTS' },
        { type: 'SET_SINGLE_AMOUNT', index, amount, displayAmount, balance: toBN(balance || 0), allowance: toBN(allowance || 0) },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountOut), displayAmount: poolDisplayAmount }
      ];
    }

    const allInGivenPoolOut = async (exactAmount: BigNumber, displayAmount: string): Promise<MintDispatchAction[]> => {
      const result = await pool.calcAllInGivenPoolOut(exactAmount);
      const { balances, allowances, amounts, displayAmounts } = result.reduce((obj, { balance, allowance, amount }, i) => ({
        balances: [...obj.balances, toBN(balance || 0)],
        allowances: [...obj.allowances, toBN(allowance || 0)],
        amounts: [...obj.amounts, toBN(amount)],
        displayAmounts: [...obj.displayAmounts, formatBalance(toBN(amount), state.tokens[i].decimals, 4) ]
      }), { balances: [], allowances: [], amounts: [], displayAmounts: []});
      return [
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_ALL_AMOUNTS', amounts, balances, allowances, displayAmounts },
        { type: 'SET_POOL_AMOUNT', amount: toBN(exactAmount), displayAmount }
      ];
    }

    const setTokenInput = async ({ index, amount }: SetTokenInput): Promise<void> => {
      const { address, decimals } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      return dispatch(await poolOutGivenSingleIn(address, exactAmount, amount.toString(), index));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {      
      const token = state.tokens[index];
      const displayAmount = formatBalance(amount, token.decimals, 4);
      return dispatch(await poolOutGivenSingleIn(token.address, amount, displayAmount, index));
    }

    const setPoolOutput = async ({ amount }: SetPoolOutput): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      const exactAmount = toTokenAmount(amount, 18);
      if (isSingle) {
        return dispatch(await singleInGivenPoolOut(exactAmount, amount.toString(), selectedIndex));
      } else {
        return dispatch(await allInGivenPoolOut(exactAmount, amount.toString()));
      }
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      if (isSingle && action.index === selectedIndex) {
        const actions = await allInGivenPoolOut(state.poolAmountOut, formatBalance(state.poolAmountOut, 18, 4));
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const actions = await singleInGivenPoolOut(state.poolAmountOut, state.poolDisplayAmount, action.index);
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
      const amounts = new Array(tokens.length).fill(BN_ZERO);
      const displayAmounts = new Array(tokens.length).fill('0');
      return dispatch({ type: 'SET_ALL_AMOUNTS', amounts, displayAmounts, balances, allowances });
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

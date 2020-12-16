import { BigNumber, formatBalance, toBN, toTokenAmount } from "@indexed-finance/indexed.js";
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

    const singleOutGivenPoolIn = async (poolAmountIn: BigNumber, index: number, poolDisplayAmount: string): Promise<BurnDispatchAction[]> => {
      const token = tokens[index];
      const totalDenorm = tokens.reduce((total, t) => total.plus(t.denorm), toBN(0));
      const extrapolatedValueRatio = totalDenorm.div(token.usedDenorm);
      const extrapolatedValue = extrapolatedValueRatio.times(token.usedBalance)
      const poolRatio = poolAmountIn.div(pool.pool.totalSupply);
      const roughOutputEstimate = poolRatio.times(extrapolatedValue).times(
        toBN(1 - parseFloat(formatBalance(pool.pool.swapFee, 18, 4)))
      );
      let amount: BigNumber;
      if (roughOutputEstimate.gt(token.usedBalance.div(3))) {
        amount = roughOutputEstimate;
      } else {
        const result = await pool.calcSingleOutGivenPoolIn(token.address, poolAmountIn);
        amount = toBN(result.amount);
      }

      return [
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'CLEAR_ALL_AMOUNTS' },
        {
          type: 'SET_SINGLE_AMOUNT',
          index,
          amount,//: tokenAmount,
          displayAmount: formatBalance(amount, token.decimals, 4)
        },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmountIn), displayAmount: poolDisplayAmount },
        { type: 'SET_SPECIFIED_SIDE', side: 'output' }
      ];
    };

    const poolInGivenSingleOut = async (address: string, exactAmount: BigNumber, index: number, displayAmount: string): Promise<BurnDispatchAction[]> => {
      let poolAmount: BigNumber;
      if ((exactAmount.gt(tokens[index].usedBalance))) {
        poolAmount = state.poolAmountIn;
      } else {
        const result = await pool.calcPoolInGivenSingleOut(address, exactAmount);
        poolAmount = toBN(result.amount);
      }
      return [
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'CLEAR_ALL_AMOUNTS' },
        { type: 'SET_SINGLE_AMOUNT', index, amount: exactAmount, displayAmount },
        { type: 'SET_POOL_AMOUNT', amount: toBN(poolAmount), displayAmount: formatBalance(toBN(poolAmount), 18, 4) },
        { type: 'SET_SPECIFIED_SIDE', side: 'input' }
      ];
    }

    const allOutGivenPoolIn = async (exactAmount: BigNumber, displayAmount: string): Promise<BurnDispatchAction[]> => {
      const result = await pool.calcAllOutGivenPoolIn(exactAmount);
      const { amounts, displayAmounts } = result.reduce((obj, { amount, displayAmount }) => ({
        amounts: [...obj.amounts, toBN(amount)],
        displayAmounts: [...obj.displayAmounts, displayAmount ]
      }), { displayAmounts: [], amounts: []});
      return [
        { type: 'SET_ALL_AMOUNTS', amounts, displayAmounts },
        { type: 'SET_POOL_AMOUNT', amount: toBN(exactAmount), displayAmount },
        { type: 'SET_SPECIFIED_SIDE', side: 'output' }
      ];
    }

    const setPoolExact = async ({ amount }: SetPoolExact) => {
      const { isSingle, selectedIndex } = state;
      const displayAmount = formatBalance(amount, 18, 4);
      if (isSingle) {
        return dispatch(await singleOutGivenPoolIn(amount, selectedIndex, displayAmount));
      } else {
        return dispatch(await allOutGivenPoolIn(amount, displayAmount));
      }
    }

    const setTokenOutput = async ({ index, amount }: SetTokenOutput): Promise<void> => {
      const { address, decimals, usedBalance } = tokens[index];
      const exactAmount = toTokenAmount(amount, decimals);
      return dispatch(await poolInGivenSingleOut(address, exactAmount, index, amount.toString() || '0'));
    };

    const setTokenExact = async ({ index, amount }: SetTokenExact): Promise<void> => {
      const { address, decimals } = state.tokens[index];
      const displayAmouunt = formatBalance(amount, decimals, 4)
      return dispatch(await poolInGivenSingleOut(address, amount, index, displayAmouunt));
    }

    const setPoolInput = async ({ amount }: SetPoolInput): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      const exactAmount = toTokenAmount(amount, 18);
      if (isSingle) {
        return dispatch(await singleOutGivenPoolIn(exactAmount, selectedIndex, amount.toString() || '0'));
      } else {
        return dispatch(await allOutGivenPoolIn(exactAmount, amount.toString() || '0'));
      }
    }

    const toggleToken = async (action: ToggleToken): Promise<void> => {
      const { isSingle, selectedIndex } = state;
      if (isSingle && action.index === selectedIndex) {
        const actions = await allOutGivenPoolIn(state.poolAmountIn, state.poolDisplayAmount);
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      } else {
        const { usedBalance, address } = state.tokens[action.index];
        const amount = state.amounts[action.index];
        const maximumInput = usedBalance.div(3);
        const exceedsMaximum = amount.gt(maximumInput);
        const poolOut = exceedsMaximum ? maximumInput : amount;
        const displayAmount = formatBalance(poolOut, 18, 4);

        console.log('USED BALANCE', usedBalance)

        const actions = !exceedsMaximum ?
          await singleOutGivenPoolIn(state.poolAmountIn, action.index, state.poolDisplayAmount) :
          await poolInGivenSingleOut(address, poolOut, action.index, displayAmount)
        ;
        return dispatch([
          ...actions,
          { type: 'TOGGLE_SELECT_TOKEN', index: action.index }
        ]);
      }
    }

    const updatePool = async (): Promise<void> => {
      await state.pool.update();
      let emptyArr = new Array(tokens.length).fill(BN_ZERO);
      return dispatch({ type: 'SET_ALL_AMOUNTS', amounts: emptyArr, displayAmounts: new Array(tokens.length).fill('0') });
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

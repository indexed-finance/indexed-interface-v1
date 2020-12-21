import { BigNumber, formatBalance, toBN, toHex, toTokenAmount, toWei } from "@indexed-finance/indexed.js";
import Minter from '@indexed-finance/indexed.js/dist/minter';
import { MintParams } from '@indexed-finance/indexed.js/dist/minter/types';
import { TokenAmount } from "@indexed-finance/indexed.js/dist/pool-helper";
import { getAddress } from "ethers/lib/utils";
import { withMiddleware } from ".";
import { ZERO_ADDRESS } from "../../assets/constants/addresses";
import { whitelistTokens } from "../../assets/constants/parameters";
import {
  UniswapMinterDispatch,
  UniswapMinterDispatchAction,
  UniswapMinterMiddlewareAction,
  SetInputExact,
  SetInputAmount,
  SetOutputAmount,
  SetHelper,
  SelectToken,
  UpdateBalances
} from "../actions/uniswap-minter-actions";
import { UniswapMinterState, UniswapMinterToken } from "../reducers/uniswap-minter-reducer";

type UniswapMinterDispatchType = (action: UniswapMinterMiddlewareAction | UniswapMinterDispatchAction) => Promise<void>;

export const withUniswapMinterMiddleware = (
  state: UniswapMinterState, dispatch: UniswapMinterDispatch
): UniswapMinterDispatchType => withMiddleware(state, dispatch)(uniswapMinterMiddleware);

export const uniswapMinterMiddleware = (state: UniswapMinterState) => (next: UniswapMinterDispatch) => uniswapMinterDispatchMiddleware(next, state);

const BN_ZERO = toBN(0);

function uniswapMinterDispatchMiddleware(dispatch: UniswapMinterDispatch, state: UniswapMinterState) {
  return (action: UniswapMinterMiddlewareAction | UniswapMinterDispatchAction ): Promise<void> => {
    console.log(`UniswapMinterMiddleware:: ${action.type}`);

    async function setInput(amount: BigNumber, displayAmount: string): Promise<void> {
      const input = { ...state.input };
      if (input.displayAmount == displayAmount) return;
      input.amount = amount;
      input.displayAmount = displayAmount;

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'input' },
        { type: 'SET_INPUT_TOKEN', token: input }
      ]);
    }

    async function setOutputAmount(action: SetOutputAmount): Promise<void> {
      const output = { ...state.output };
      if (output.displayAmount == action.amount) return;
      output.displayAmount = action.amount;
      output.amount = toTokenAmount(action.amount, output.decimals);
      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_OUTPUT_TOKEN', token: output }
      ]);
      updateParams(
        { ...state.input },
        output,
        'output'
      )
      // if (!(+action.amount)) {
      //   dispatch([
      //     { type: 'SET_SPECIFIED_SIDE', side: 'output' },
      //     { type: 'SET_OUTPUT_TOKEN', token: output }
      //   ]);
      // } else {
      //   updateParams(
      //     { ...state.input },
      //     output,
      //     'output'
      //   )
      // }
    }

    async function setInputAmount(action: SetInputAmount): Promise<void> {
      return;
      const { decimals } = state.input;
      const amount = toTokenAmount(action.amount, decimals);
      if (!(+action.amount)) {
        setInput(amount, action.amount);
      }
      //  else {
        // updateParams(
          // { ...state.input, displayAmount: action.amount, amount },
          // {...state.output},
          // 'input'
        // )
      // }
    }

    async function setInputExact(action: SetInputExact): Promise<void> {
      return;
      const { decimals } = state.input;
      const displayAmount = formatBalance(action.amount, decimals, 4);
      if (displayAmount == '' || !(+displayAmount)) {
        setInput(action.amount, displayAmount);
      }
      // else {
        // updateParams(
          // {...state.input, displayAmount, amount: action.amount},
          // {...state.output},
          // 'input'
        // )
      // }
    }

    async function updateParams(
      input: UniswapMinterToken,
      output: UniswapMinterToken,
      specifiedSide: 'input' | 'output'
    ): Promise<void> {
      console.log('Updating params...')
      // let input = { ...state.input };
      // let output = { ...state.output };
      // let specifiedSide = state.specifiedSide;
      const minter = state.minter;
      if (!minter) {
        console.log('No minter, skipping!')
        return;
      }
      let newParams: MintParams;
      let { amount, address } = input;
      let options = { slippage: state.slippage }
      function updateInput(tokenAmount: TokenAmount) {
        if (+(tokenAmount.displayAmount) != +(input.displayAmount)) {
          input.displayAmount = tokenAmount.displayAmount;
          input.amount = toBN(tokenAmount.amount);
        }
      }
      function updateOutput(tokenAmount: TokenAmount) {
        if (+(tokenAmount.displayAmount) != +(output.displayAmount)) {
          output.displayAmount = tokenAmount.displayAmount;
          output.amount = toBN(tokenAmount.amount);
        }
      }
      if (specifiedSide == 'input') {
        if (!(+input.displayAmount)) {
          console.log(`No input or output, skipping!`);
          return;
        }
        if (address == ZERO_ADDRESS) {
          console.log('Setting params for ether input')
          console.log(`Input ${toHex(amount)}`);
          newParams = await minter.getBestParams_ExactEthForPool(
            toHex(amount), options
          );
          console.log(newParams)
          switch(newParams.fn) {
            case 'swapETHForAllTokensAndMintExact': {
              updateInput(newParams.maxEthInput);
              updateOutput(newParams.poolOutput);
              break;
            }
            case 'swapExactETHForTokensAndMint': {
              updateInput(newParams.ethInput);
              updateOutput(newParams.minPoolOutput);
            }
          }
        } else {
          console.log('Setting params for token input')
          console.log(`Input ${toHex(amount)}`);
          newParams = await minter.getBestParams_ExactTokensForPool(
            address, toHex(amount), options
          );
          console.log(newParams)
          switch(newParams.fn) {
            case 'swapExactTokensForTokensAndMint': {
              updateInput(newParams.tokenInput);
              updateOutput(newParams.minPoolOutput);
              break;
            }
            case 'swapTokensForAllTokensAndMintExact': {
              updateInput(newParams.maxTokenInput);
              updateOutput(newParams.poolOutput);
              break;
            }
          }
        }
      } else {
        if (!(+output.displayAmount)) {
          console.log(`No input or output, skipping!`);
          return;
        }
        if (address == ZERO_ADDRESS) {
          console.log('Setting params for ether with output specified')
          console.log(`Input ${toHex(output.amount)}`);
          newParams = await minter.getBestParams_EthForPoolExact(toHex(output.amount), options);
          console.log(newParams)
          updateInput(newParams.maxEthInput);
          updateOutput(newParams.poolOutput);
        } else {
          console.log('Setting params for tokens with output specified')
          console.log(`Input ${toHex(output.amount)}`);
          try {
          newParams = await minter.getBestParams_TokensForPoolExact(getAddress(input.address), toHex(output.amount), options);
          console.log(newParams)
          updateInput(newParams.maxTokenInput);
          updateOutput(newParams.poolOutput);
          }catch(err) {
            console.log(`CAUGHT ERROR IN MIDDLEWARE -- DUMPING PAIRS`);
            for (let p of minter.pairs) {
              console.log(`${p.token0.symbol} <-> ${p.token1.symbol}`)
            }
            console.log(`CAUGHT ERROR IN MIDDLEWARE -- DUMPING TOKEN`);
            console.log(minter.getTokenByAddress(input.address))

            throw err;
          }
        }
      }
      console.log('Got minter params, fn: ', newParams.fn)

      dispatch([
        // { type: 'SET_SPECIFIED_SIDE', side: specifiedSide },
        { type: 'SET_PARAMS', params: newParams },
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output },
        { type: 'SET_LOADING', loading: false }
      ]);
    }

    async function setHelper(action: SetHelper): Promise<void> {
      await action.pool.waitForUpdate;
      const whitelist = whitelistTokens.filter(
        t => (
          !(action.pool.tokens.find(pt => pt.address.toLowerCase() == t.address.toLowerCase()))
        )
      )
      const minter = await Minter.getMinter(
        action.pool.provider,
        process.env.REACT_APP_ETH_NETWORK === 'mainnet' ? 1 : 4,
        whitelist.filter(t => t.address !== ZERO_ADDRESS),
        action.pool
      );
      const defaultToken = whitelist.find(t => t.address === ZERO_ADDRESS);

      dispatch([
        { type: 'SET_MINTER', pool: action.pool, minter },
        {
          type: 'SET_OUTPUT_TOKEN',
          token: {
            decimals: 18,
            address: action.pool.address,
            displayAmount: '',
            amount: BN_ZERO
          }
        },
        { type: 'SET_INPUT_TOKEN', token: { ...defaultToken, amount: BN_ZERO, displayAmount: '' } },
      ]);
    }

    async function selectToken(action: SelectToken): Promise<void> {
      const { index } = action;
      const token = state.whitelist[index];

      dispatch([
        { type: 'SET_SPECIFIED_SIDE', side: 'output' },
        { type: 'SET_INPUT_TOKEN', token: { ...token, amount: BN_ZERO, displayAmount: '' } },
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
      if (state.minter) {
        await state.minter.updateUserBalances();
      }
      return dispatch([
        { type: 'SET_INPUT_TOKEN', token: input },
        { type: 'SET_OUTPUT_TOKEN', token: output }
      ]);
    }

    const fallback = async (action: UniswapMinterDispatchAction) => dispatch(action);

    switch (action.type) {
      case 'SET_INPUT_AMOUNT': return setInputAmount(action);
      case 'SET_INPUT_EXACT': return setInputExact(action);
      case 'SET_OUTPUT_AMOUNT': return setOutputAmount(action);
      case 'SET_HELPER': return setHelper(action);
      case 'UPDATE_POOL': return updatePool(action);
      case 'SELECT_TOKEN': return selectToken(action);
      case 'UPDATE_PARAMS': return updateParams(state.input, state.output, state.specifiedSide);
      // case 'UPDATE_PARAMS': return updateParams();
      default: return fallback(action);
    }
  }
}

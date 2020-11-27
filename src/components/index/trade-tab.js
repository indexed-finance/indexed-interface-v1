import { formatBalance, UniswapHelper } from '@indexed-finance/indexed.js';
import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { Grid, IconButton, styled } from '@material-ui/core';
import React, { useEffect, useContext, useState } from 'react'
import Swap from '@material-ui/icons/SwapCalls'

import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'

import { store } from '../../state';
import { useTradeState } from '../../state/trade';
import TradeInput from './trade-input';
import { getERC20 } from '../../lib/erc20';
import ButtonPrimary from '../buttons/primary';
import Input from '../inputs/input';
import { toContract } from '../../lib/util/contracts';

const routerABI = require('../../assets/constants/abi/UniswapV2Router.json')

const WETH = "0xc778417e063141139fce010982780140aa0cd5ab"

const useStyles = getStyles(style);

const Trigger = styled(ButtonPrimary)({
  marginTop: '25px !important'
})

export default function TradeTab({ metadata }) {
  const { useInput, useOutput, tradeState, setHelper, updatePool, whitelistTokens, selectWhitelistToken, switchTokens } = useTradeState();
  const [ isRendered, setRender ] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState(false);

  let { state, handleTransaction } = useContext(store);
  const classes = useStyles()

  useEffect(() => {
    if (
      tradeState.helper ||
      !metadata ||
      !metadata.address ||
      metadata.addresss === '0x0000000000000000000000000000000000000000' ||
      !state.web3.injected
    ) {
      console.log(metadata)
      return console.log(`Skipping Setter`);
    }
    const setPool = async () => {
      console.log(`Setting Pool With Whitelist`);
      console.log(whitelistTokens)
      console.log(`Setting Pool With Metadata`);
      console.log(metadata)
      const poolToken = {
        address: metadata.address,
        decimals: 18,
        symbol: metadata.symbol
      }
      const helper = new UniswapHelper(state.web3.injected, poolToken, whitelistTokens, state.account);
      setHelper(helper);
    }
    setPool();
  }, [ state.web3.injected, metadata ]);

  useEffect(() => {
    if (!state.account || !tradeState.helper || tradeState.helper.userAddress) return;
    const setAcct = async () => {
      tradeState.helper.setUserAddress(state.account);
      await tradeState.helper.waitForUpdate;
      updatePool();
    }
    setAcct()
  }, [state.account]);

  let whitelistSymbols = whitelistTokens.map(t => t.symbol);
  let inputSymbol, outputSymbol;
  if (tradeState.helper) {
    inputSymbol = tradeState.helper.getTokenInfo(tradeState.input.address).symbol;
    outputSymbol = tradeState.helper.getTokenInfo(tradeState.output.address).symbol;

  }

  useEffect(() => {
    if (!tradeState.helper) return;
    let amount = tradeState.input.amount
    let allowance = tradeState.getAllowanceForPair(tradeState.input.address);

    if(tradeState.input.address == WETH) setApprovalNeeded(false);
    else setApprovalNeeded(amount.gt(allowance));

    setRender(true);
  }, [tradeState]);

  async function approveRouter() {
    if (!approvalNeeded) return;
    const erc20 = getERC20(state.web3.injected, tradeState.input.address);
    let fn = erc20.methods.approve('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', toHex(tradeState.input.amount))
    await handleTransaction(fn.send({ from: state.account }))
      .then(() => updatePool())
      .catch((() => {}));
  }

  async function executeSwap() {
    const amountIn = toHex(tradeState.input.amount.integerValue());
    const amountOut = toHex(tradeState.output.amount.integerValue());
    const tokenIn = tradeState.input.address;
    const tokenOut = tradeState.output.address;
    const pair = toContract(state.web3.injected, routerABI, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    let { timestamp } = await state.web3.injected.eth.getBlock('latest');
    let txProps = { from: state.account }
    let fn = () => {}

    if(tokenIn == WETH) {
      txProps = { from: state.account, value: amountIn }
      fn = pair.methods.swapETHForExactTokens(
        amountOut,
        [tokenIn, tokenOut],
        state.account,
        (+timestamp) + 600);
    } else if(tokenOut == WETH) {
      fn = pair.methods.swapExactTokensForETH(
        amountIn,
        amountOut,
        [tokenIn, tokenOut],
        state.account,
        (+timestamp) + 600);
    } else {
      fn = pair.methods.swapExactTokensForTokens(
        amountIn,
        amountOut,
        [tokenIn, tokenOut],
        state.account,
        (+timestamp) + 600);
    }

    await handleTransaction(fn.send(txProps));
    updatePool(true);
  }

  let priceString = tradeState.helper ? `1 ${inputSymbol} = ${tradeState.price} ${outputSymbol}` : '';

  let feeString;
  if (tradeState.helper) {
    const { amount, decimals, address } = tradeState.input;
    const { symbol } = tradeState.helper.getTokenInfo(address);
    const fee = formatBalance(amount.times(3).div(1000), decimals, 4);
    feeString = `${fee} ${symbol}`;
  }

  let { width } = style.getFormatting(state.native)

  return (
    <Grid container direction='column' alignItems='center' justify='space-around' style={{ width }}>
      <Grid item xs={12} md={12} lg={12} xl={12} key='0'>
        {
          tradeState.helper && <TradeInput inputWidth={250} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useInput} />
        }
        {
          !isRendered && <Input label='AMOUNT' variant='outlined' style={{ width: 250 }} InputProps={{ endAdornment: 'ETH' }} />
        }
      </Grid >
      <Grid item xs={12} md={12} lg={12} xl={12} key='1'>
        <div className={classes.swap}>
          <IconButton onClick={switchTokens}> <Swap /> </IconButton>
          <p>{priceString}</p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='2'>
        {
          tradeState.helper && <TradeInput inputWidth={250} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useOutput} />
        }
        {
          !isRendered && <Input label='AMOUNT' variant='outlined' style={{ width: 250 }} InputProps={{ endAdornment: metadata.symbol }} />
        }
      </Grid>

      <Grid item xs={12} md={12} lg={12} xl={12} key='3' style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> FEE: <span> {feeString} </span> </p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='4'>
        {approvalNeeded && <Trigger onClick={approveRouter}> APPROVE </Trigger> }
        {tradeState.ready && <Trigger onClick={executeSwap}> SWAP </Trigger> }
      </Grid>
    </Grid>
  )
}

import { formatBalance, UniswapHelper } from '@indexed-finance/indexed.js';
import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { Grid, IconButton, styled } from '@material-ui/core';
import React, { useEffect, useContext, useState } from 'react'
import Swap from '@material-ui/icons/SwapCalls'

import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'

import { store } from '../../state';
import { ZERO_ADDRESS } from '../../assets/constants/addresses'
import { useTradeState } from '../../state/trade';
import TradeInput from './trade-input';
import { getERC20 } from '../../lib/erc20';
import ButtonPrimary from '../buttons/primary';
import Input from '../inputs/input';
import { toContract } from '../../lib/util/contracts';
import { getETHPrice } from '../../api/gql';
import { SlippgeExceedsTrueValue } from '../helper-tooltip';

const routerABI = require('../../assets/constants/abi/UniswapV2Router.json')

const useStyles = getStyles(style);

export default function TradeTab({ metadata }) {
  const { useInput, usdRate, isWethPair, feeString, priceString, useOutput, tradeState, setHelper, updatePool, whitelistTokens, selectWhitelistToken, switchTokens } = useTradeState();
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [ isRendered, setRender ] = useState(false);
  const [ ethUSD, setPrice ] = useState(0)

  let { state, handleTransaction } = useContext(store);
  const classes = useStyles()

  useEffect(() => {
    if (tradeState.helper || !metadata || !metadata.address ||
      metadata.addresss === ZERO_ADDRESS || !state.web3.injected) {
      return console.log(`Skipping Setter`);
    }
    const setPool = async () => {
      const quoteEthUSD = await getETHPrice()
      const poolToken = {
        address: metadata.address,
        decimals: 18,
        symbol: metadata.symbol
      }
      const helper = new UniswapHelper(
        state.web3.injected,
        poolToken,
        whitelistTokens,
        state.account
      );
      setPrice(parseFloat(quoteEthUSD))
      setHelper(helper);
      setRender(true);
    }
    if(!tradeState.helper) setPool();
  }, [ state.web3.injected, metadata ]);

  useEffect(() => {
    const verifyConnectivity = async() => {
      if(tradeState.helper && (state.web3.injected || window.ethereum)) {
        if(!tradeState.helper.userAddress || state.account &&
          state.account.toLowerCase() !== tradeState.helper.userAddress.toLowerCase()) {
            await tradeState.helper.setUserAddress(state.account)
        }
        await tradeState.helper.waitForUpdate;
        await updatePool()
      }
    }
    verifyConnectivity()
  }, [  , state.web3.injected, isRendered ])

  let whitelistSymbols = whitelistTokens.map(t => t.symbol);

  useEffect(() => {
    if (!tradeState.helper)  return;

    let amount = tradeState.input.amount
    let allowance = tradeState.getAllowanceForPair(tradeState.input.address);

    if(tradeState.input.address == process.env.REACT_APP_WETH) setApprovalNeeded(false);
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

    if(tokenIn.toLowerCase() == process.env.REACT_APP_WETH) {
      txProps = { from: state.account, value: amountIn }
      fn = pair.methods.swapETHForExactTokens(
        amountOut,
        [tokenIn, tokenOut],
        state.account,
        (+timestamp) + 600);
    } else if(tokenOut.toLowerCase() == process.env.REACT_APP_WETH) {
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

  let { inputWidth, width, marginRight } = style.getFormatting(state.native)
  let usdPricePerToken = parseFloat(parseFloat(ethUSD) * usdRate) * 1.01
  let exceedsTrueUSDValue = !isWethPair ? usdPricePerToken > parseFloat(metadata.price) : usdPricePerToken  < parseFloat(metadata.price);

  return (
    <Grid container direction='column' alignItems='center' justify='space-around' style={{ width }}>
      <Grid item xs={12} md={12} lg={12} xl={12} key='0'>
        {
          tradeState.helper && <TradeInput inputWidth={inputWidth} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useInput} />
        }
        {
          !tradeState.helper  && <Input label='AMOUNT' variant='outlined' style={{ width: inputWidth }} InputProps={{ endAdornment: 'ETH' }} />
        }
      </Grid >
      <Grid item xs={12} md={12} lg={12} xl={12} key='1'>
        <div className={classes.swap}>
          <p>{priceString}</p>
          <IconButton onClick={!tradeState.helper ? () => {} : switchTokens}> <Swap /> </IconButton>
          <p style={{ color: exceedsTrueUSDValue ? '#f44336' : '#00e79a' }}>
            1 {metadata.symbol} = ${parseFloat((usdPricePerToken).toFixed(2)).toLocaleString()}
            &nbsp;{exceedsTrueUSDValue ? <SlippgeExceedsTrueValue isWethPair={isWethPair} /> : <></> }
          </p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='2'>
        {
          tradeState.helper && <TradeInput inputWidth={inputWidth} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useOutput} />
        }
        {
          !tradeState.helper  && <Input label='AMOUNT' variant='outlined' style={{ width: inputWidth }} InputProps={{ endAdornment: metadata.symbol }} />
        }
      </Grid>

      <Grid item xs={12} md={12} lg={12} xl={12} key='3' style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> FEE: <span style={{ marginRight }}> {feeString} </span> </p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='4'>
        {!approvalNeeded && <ButtonPrimary disabled={!tradeState.ready} margin={{ margin: 25, marginLeft: 150 }} onClick={executeSwap}> SWAP </ButtonPrimary> }
        {approvalNeeded && <ButtonPrimary margin={{ margin: 25, marginLeft: 150 }} onClick={approveRouter}> APPROVE </ButtonPrimary> }
      </Grid>
    </Grid>
  )
}

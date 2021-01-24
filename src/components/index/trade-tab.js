import { formatBalance, UniswapHelper } from '@indexed-finance/indexed.js';
import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { Grid, IconButton, styled } from '@material-ui/core';
import React, { useEffect, useContext, useState } from 'react'
import Swap from '@material-ui/icons/SwapVertOutlined'

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
import { SlippgeExceedsTrueValue } from '../utils/popper';
import { useTimeout } from '../../hooks/useTimeout';
import Web3RequiredPrimaryButton from '../buttons/web3-required-primary';
import { useTranslation } from 'react-i18next';

const routerABI = require('../../assets/constants/abi/UniswapV2Router.json')

const useStyles = getStyles(style);

function SwitchButton({ switchTokens }) {
  const [ disabled, setDisabled ] = useState(false);
  const { startTimer } = useTimeout(() => setDisabled(false));

  function doSwitch() {
    setDisabled(true);
    switchTokens();
    startTimer(2000);
  }

  return <IconButton disabled={disabled} onClick={doSwitch}> <Swap /> </IconButton>;
}

export default function TradeTab({ metadata }) {
  const { useInput, usdRate, isWethPair, feeString, priceString, useOutput, tradeState, setHelper, updatePool, whitelistTokens, selectWhitelistToken, switchTokens } = useTradeState();
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [ isRendered, setRender ] = useState(false);
  const [ ethUSD, setPrice ] = useState(0)

  let { state, handleTransaction } = useContext(store);
  const classes = useStyles()
  const { t } = useTranslation();

  useEffect(() => {
    if (
      tradeState.helper ||
      !metadata ||
      !metadata.address ||
      metadata.addresss === ZERO_ADDRESS ||
      !state.web3[process.env.REACT_APP_ETH_NETWORK]
    ) {
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
        state.web3[process.env.REACT_APP_ETH_NETWORK],
        poolToken,
        whitelistTokens,
        state.account
      );
      setPrice(parseFloat(quoteEthUSD));
      setHelper(helper);
      setRender(true);
    }
    if(!tradeState.helper) setPool();
  }, [ state.web3[process.env.REACT_APP_ETH_NETWORK], metadata ]);

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
    const amountIn = tradeState.input.amount.integerValue();
    const amountOut = tradeState.output.amount.integerValue();
    const tokenIn = tradeState.input.address;
    const tokenOut = tradeState.output.address;
    const pair = toContract(state.web3.injected, routerABI, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    let { timestamp } = await state.web3.injected.eth.getBlock('latest');
    let txProps = { from: state.account }
    let fn = () => {}

    if(tokenIn.toLowerCase() == process.env.REACT_APP_WETH) {
      txProps = { from: state.account, value: amountIn }
      if (tradeState.side === 'input') {
        fn = pair.methods.swapExactETHForTokens(
          toHex(amountOut),
          [tokenIn, tokenOut],
          state.account,
          (+timestamp) + 600
        );
      } else {
        fn = pair.methods.swapETHForExactTokens(
          toHex(amountOut),
          [tokenIn, tokenOut],
          state.account,
          (+timestamp) + 600
        );
      }
    } else if(tokenOut.toLowerCase() == process.env.REACT_APP_WETH) {
      if (tradeState.side == 'input') {
        fn = pair.methods.swapExactTokensForETH(
          toHex(amountIn),
          toHex(amountOut),
          [tokenIn, tokenOut],
          state.account,
          (+timestamp) + 600
        );
      } else {
        fn = pair.methods.swapTokensForExactETH(
          toHex(amountOut),
          toHex(amountIn),
          [tokenIn, tokenOut],
          state.account,
          (+timestamp) + 600
        );
      }
    } else {
      fn = pair.methods.swapExactTokensForTokens(
        amountIn,
        amountOut,
        [tokenIn, tokenOut],
        state.account,
        (+timestamp) + 600
      );
    }

    await handleTransaction(fn.send(txProps));
    updatePool(true);
  }

  let { inputWidth, width, marginRight } = style.getFormatting(state.native)
  let usdPricePerToken = parseFloat(parseFloat(ethUSD) * usdRate) * 1.005
  let exceedsTrueUSDValue = isWethPair ? usdPricePerToken > parseFloat(metadata.price) : usdPricePerToken  < parseFloat(metadata.price);

  return (
    <Grid container direction='column' alignItems='center' justify='space-around' style={{ width }}>
      <Grid item xs={12} md={12} lg={12} xl={12} key='0'>
        {
          tradeState.helper && <TradeInput label={t('send')} inputWidth={inputWidth} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useInput} />
        }
        {
          !tradeState.helper  && <Input label={t('amount')} variant='outlined' style={{ width: inputWidth }} InputProps={{ endAdornment: 'ETH' }} />
        }
      </Grid >
      <Grid item xs={12} md={12} lg={12} xl={12} key='1'>
        {
          tradeState.helper && <div className={classes.swap}>
            <p>{priceString}</p>
            <SwitchButton switchTokens={switchTokens} />
            <p style={{ color: exceedsTrueUSDValue ? '#f44336' : '#00e79a' }}>
              1 {metadata.symbol} = ${parseFloat((usdPricePerToken).toFixed(2)).toLocaleString()}
              &nbsp;{exceedsTrueUSDValue ? <SlippgeExceedsTrueValue isWethPair={isWethPair} /> : <></> }
            </p>
          </div>
        }
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='2'>
        {
          tradeState.helper && <TradeInput label={t('receive')} inputWidth={inputWidth} selectWhitelistToken={selectWhitelistToken} whitelistSymbols={whitelistSymbols} useToken={useOutput} />
        }
        {
          !tradeState.helper  && <Input label={t('amount')} variant='outlined' style={{ width: inputWidth }} InputProps={{ endAdornment: metadata.symbol }} />
        }
      </Grid>

      <Grid item xs={12} md={12} lg={12} xl={12} key='3' style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> {t('fee')}: <span style={{ marginRight }}> {feeString} </span> </p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} key='4'>
        {!approvalNeeded && <Web3RequiredPrimaryButton
          disabled={!tradeState.ready}
          margin={{ margin: 25, marginLeft: 150 }}
          onClick={executeSwap}
          label={t('swapLabel')}
        /> }
        {approvalNeeded && <Web3RequiredPrimaryButton
          margin={{ margin: 25, marginLeft: 150 }}
          onClick={approveRouter}
          label={t('approve')}
        />}
      </Grid>
    </Grid>
  )
}

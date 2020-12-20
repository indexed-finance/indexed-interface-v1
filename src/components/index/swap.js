import React, { Fragment, useEffect, useContext, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import SwapIcon from '@material-ui/icons/SwapCalls'
import { formatBalance, toHex } from '@indexed-finance/indexed.js'

import { useSwapState } from "../../state/swap";
import ButtonPrimary from '../buttons/primary'
import Adornment from '../inputs/adornment'
import SwapInput from '../inputs/exchange'
import Input from '../inputs/input'
import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'
import { getERC20 } from '../../lib/erc20';
import { toContract } from '../../lib/util/contracts';

const useStyles = getStyles(style)

export default function Swap({ metadata }){
  let { useInput, selectOutput, outputList, tokenList, selectToken, useOutput, swapState,
    setTokens, priceString, setHelper, updatePool, switchTokens, feeString } = useSwapState()
  const [ tokenMetadata, setTokenMetadata] = useState({})
  const [ approvalNeeded, setApprovalNeeded ] = useState(false)
  const [ isInit, setInit ] = useState(false)
  const classes = useStyles()

  let { state, dispatch, handleTransaction} = useContext(store)

  async function approvePool() {
    let { amount, address } = swapState.input

    const erc20 = getERC20(state.web3.injected, address);
    let fn = erc20.methods.approve(metadata.address, toHex(amount))
    await handleTransaction(fn.send({ from: state.account }))
      .then(async() =>  await updatePool())
      .catch((() => {}));
  }

  const swapTokens = async() => {
    const { input, output, specifiedSide, price } = swapState
    const { address } = swapState.pool
    const abi = require('../../assets/constants/abi/BPool.json').abi;
    const pool = toContract(state.web3.injected, abi, address);
    const amountOut = toHex(output.amount);
    const amountIn = toHex(input.amount);
    const maxPrice = toHex(price);
    let fn;

    if(specifiedSide === 'input'){
      fn = pool.methods.swapExactAmountIn(input.address, amountIn, output.address, amountOut, maxPrice);
    } else {
      fn = pool.methods.swapExactAmountOut(input.address, amountIn, output.address, amountOut, maxPrice);
    }

    await handleTransaction(fn.send({ from: state.account }))
      .then(async () => {
        await updatePool();
    }).catch(() => {});
  }

  useEffect(() => {
    if(!tokenList && metadata.assets && metadata.assets.length > 0){
      setTokens(metadata.assets)
    }
  }, [ state.indexes, metadata ])

  useEffect(() => {
    if(!swapState.pool && state.helper){
      let pool = state.helper.initialized.find(i => i.pool.address === metadata.address);

      if(pool){
        setHelper(pool)
        setInit(true)
      }
    }
  }, [ , state.helper, swapState.input ])

  useEffect(() => {
    const verifyConnectivity = async() => {
      if(swapState.pool && (state.web3.injected || window.ethereum)) {
        if(!swapState.pool.userAddress || state.account &&
          state.account.toLowerCase() !== swapState.pool.userAddress.toLowerCase()) {
            await swapState.pool.setUserAddress(state.account)
          }
        await updatePool()
      }
    }
    verifyConnectivity()
  }, [  , state.web3.injected, isInit ])

  useEffect(() => {
    if(!swapState.pool) return;

    let { address, amount } = swapState.input
    let { userAllowances } = swapState.pool

    if(userAllowances[address]) {
      if(amount.gt(userAllowances[address])) setApprovalNeeded(true)
      else setApprovalNeeded(false)
    }
  }, [ swapState ])

  useEffect(() => {
    if(!state.load) {
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [])

  let { marginRight, width } = style.getFormatting(state.native)

  return (
    <Grid container direction='column' justify='space-between' alignItems='center' style={{ width }}>
      <Grid item>
        {swapState.pool && <SwapInput onSelect={selectToken} tokens={tokenList} useToken={useInput} label='EXCHANGE' />}
        {!swapState.pool && <Input label='EXCHANGE' variant='outlined' style={{ width: 300 }} InputProps={{ endAdornment: ' ' }} />}
      </Grid>
      <Grid item>
        <div className={classes.swap}>
          <IconButton onClick={!swapState.pool ? () => {} : switchTokens}> <SwapIcon /> </IconButton>
          <p>{priceString}</p>
        </div>
      </Grid>
      <Grid item>
        {swapState.pool && <SwapInput onSelect={selectOutput} tokens={outputList} useToken={useOutput} label='RECIEVE' />}
        {!swapState.pool && <Input label='RECIEVE' variant='outlined' style={{ width: 300 }} InputProps={{ endAdornment: ' ' }} />}
      </Grid>
      <Grid item style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> FEE: <span style={{ marginRight }}> {feeString} </span> </p>
        </div>
      </Grid>
      <Grid item>
        { !approvalNeeded && <ButtonPrimary onClick={swapTokens} disabled={!swapState.ready} variant='outlined' margin={{  margin: 25, marginLeft: 150 }}> SWAP </ButtonPrimary>}
        { approvalNeeded && <ButtonPrimary onClick={approvePool} variant='outlined' margin={{  margin: 25, marginLeft: 150 }}> APPROVE </ButtonPrimary>}
      </Grid>
    </Grid>
  )
}

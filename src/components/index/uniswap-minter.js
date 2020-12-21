import React, { useEffect, useContext, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import { Dialog, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';

import { toHex } from '@indexed-finance/indexed.js'

import ButtonPrimary from '../buttons/primary'
import SwapInput from '../inputs/exchange'
import Input from '../inputs/input'
import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'
import { getERC20 } from '../../lib/erc20';
import { ZERO_ADDRESS } from '../../assets/constants/addresses';
import { useMintState } from '../../state/mint';
import { toContract } from '../../lib/util/contracts';

const MinterABI = require('../../assets/constants/abi/IndexedUniswapRouterMinter.json');

const useStyles = getStyles(style)

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function UniswapMinter({ metadata }){
  let {
    uniswapMinter: {
      useInput,
      useOutput,
      minterState,
      setHelper,
      updatePool,
      selectToken,
      tokenList,
      toggleDisplay,
      message,
    }
  } = useMintState();

  const [ isInit, setInit ] = useState(false)
  const classes = useStyles()

  let { state, dispatch, handleTransaction} = useContext(store)

  async function approvMinter() {
    let { amount, address } = minterState.input;
    if (address != ZERO_ADDRESS) {
      const erc20 = getERC20(state.web3.injected, address);
      let fn = erc20.methods.approve(minterState.minter.minterAddress, toHex(amount))
      await handleTransaction(fn.send({ from: state.account }))
        .then(async() =>  await updatePool())
        .catch((() => {}));
    }
  }

  useEffect(() => {
    if(!minterState.pool && state.helper) {
      let pool = state.helper.initialized.find(i => i.pool.address === metadata.address);

      if(pool) {
        setHelper(pool)
        setInit(true)
      }
    }
  }, [ , state.helper, minterState.input ])

  useEffect(() => {
    const verifyConnectivity = async() => {
      console.log('Verifying connectivity')
      console.log(`Injected: ${!!state.web3.injected}`);
      console.log(`Account: ${!!state.account}`)
      console.log(`Minter: ${!!minterState.minter}`)
      if(minterState.minter && (!!state.web3.injected || !!window.ethereum)) {
        console.log('Verifying connectivity pt 1')
        let address = state.account.toLowerCase();
        if (minterState.pool.userAddress.toLowerCase() !== address) {
          console.log('Verifying connectivity pt 2')
          await minterState.pool.setUserAddress(address);
          updatePool();
        }
      }
    }
    verifyConnectivity()
  }, [ state.web3.injected, !!minterState.minter ])

  async function mintTokens() {
    const { params, minter, input, pool } = minterState;
    console.log(`Account: ${state.account}`)
    const minterContract = toContract(state.web3.injected, MinterABI, minter.minterAddress);
    let fn;
    let opts = { from: state.account };
    switch(params.fn) {
      case 'swapTokensForTokensAndMintExact': {
        fn = minterContract.methods.swapTokensForTokensAndMintExact(
          params.maxTokenInput.amount,
          params.path,
          pool.address,
          params.poolOutput.amount
        );
        break;
      }
      case 'swapTokensForAllTokensAndMintExact': {
        fn = minterContract.methods.swapTokensForAllTokensAndMintExact(
          params.maxTokenInput.address,
          params.maxTokenInput.amount,
          params.intermediaries,
          pool.address,
          params.poolOutput.amount
        );
        break;
      }
      case 'swapETHForTokensAndMintExact': {
        fn = minterContract.methods.swapETHForTokensAndMintExact(
          params.path,
          pool.address,
          params.poolOutput.amount
        );
        opts.value = params.maxEthInput.amount
        break;
      }
      case 'swapETHForAllTokensAndMintExact': {
        fn = minterContract.methods.swapETHForAllTokensAndMintExact(
          pool.address,
          params.intermediaries,
          params.poolOutput.amount
        );
        opts.value = params.maxEthInput.amount
        break;
      }
      default: {
        throw Error('err');
      }
    }
    await handleTransaction(fn.send(opts))
      .then(async() =>  await updatePool())
      .catch((() => {}));
  }

  useEffect(() => {
    if (!state.load) {
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, []);


  return <Dialog
    open={true}
    className={classes.root}
    keepMounted
    TransitionComponent={Transition}
    onClose={toggleDisplay}
  >
    <DialogTitle onClose={toggleDisplay}>Uniswap Minter</DialogTitle>
    <DialogContent /* style={{ width: 600 }} */>
      
      <Grid
        container
        direction='column'
        justify='center'
        alignItems='center'
        alignContent='center'
      >
        <Grid item>
          <DialogContentText>
            Route swaps through Uniswap to mint pool tokens.
          </DialogContentText>
        </Grid>
        <Grid item>
          {minterState.pool && <SwapInput onSelect={selectToken} tokens={tokenList} useToken={useInput} label='EXCHANGE' />}
          {!minterState.pool && <Input label='EXCHANGE' type='number' variant='outlined' style={{ width: 300 }} InputProps={{ endAdornment: ' ' }} />}
        </Grid>
        <Grid item>
          <Input
            label='RECEIVE'
            variant='outlined'
            { ...(useOutput().bindInput) }
            style={{ width: 300 }}
            InputProps={{ endAdornment: metadata.symbol }}
          />
        </Grid>
        <Grid item>
          <DialogContentText style={{ fontSize: 'small', whiteSpace: 'pre' }}>
            {message}
          </DialogContentText>
        </Grid>
        <Grid item>
          {
            minterState.approvalNeeded
            ? <ButtonPrimary onClick={approvMinter} style={{ margin: 0 }} variant='filled' color="secondary">
                Approve Minter
              </ButtonPrimary>
            : <ButtonPrimary onClick={mintTokens} disabled={!minterState.ready} style={{ margin: 0 }} variant='filled' color="primary">
              Mint
            </ButtonPrimary>
          }
        </Grid>
      </Grid>
    </DialogContent>
    {/* <DialogActions >
      <ButtonPrimary disabled={minterState.loading} onClick={updateParams} variant='filled' color="primary">
        GET BEST PRICE
      </ButtonPrimary>
      
      
    </DialogActions> */}
  </Dialog>
}

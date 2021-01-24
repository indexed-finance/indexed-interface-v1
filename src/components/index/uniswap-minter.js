import React, { useEffect, useContext, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import { Dialog, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import { toHex } from '@indexed-finance/indexed.js'

import ButtonPrimary from '../buttons/primary'
import SwapInput from '../inputs/exchange'
import Input from '../inputs/input'
import style from '../../assets/css/components/modal'
import getStyles from '../../assets/css'
import { store } from '../../state'
import { getERC20 } from '../../lib/erc20';
import { ZERO_ADDRESS } from '../../assets/constants/addresses';
import { useMintState } from '../../state/mint';
import { toContract } from '../../lib/util/contracts';
import Web3RequiredPrimaryButton from '../buttons/web3-required-primary';
import { useTranslation } from 'react-i18next';

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
      approvalNeeded
    }
  } = useMintState();

  const [ isInit, setInit ] = useState(false)
  const classes = useStyles()
  const { t } = useTranslation()

  let { state, dispatch, handleTransaction} = useContext(store)

  async function approveMinter() {
    let { amount, address } = minterState.input;
    if (address !== ZERO_ADDRESS) {
      const erc20 = getERC20(state.web3.injected, address);
      let fn = erc20.methods.approve(minterState.minter.minterAddress, toHex(amount))
      handleTransaction(fn.send({ from: state.account }))
        .then(() => {
          updatePool();
        })
        .catch((() => {}));
    }
  }

  useEffect(() => {
    if(!minterState.pool && state.helper) {
      let pool = state.helper.initialized.find(i => i.pool.address === metadata.address);
      if (!pool.userAddress && state.account) {
        pool.setUserAddress(state.account);
      }
      if(pool) {
        setHelper(pool)
        setInit(true)
      }
    }
  }, [ , state.helper, minterState.input ])

  useEffect(() => {
    const verifyConnectivity = async() => {
      if(minterState.minter && state.account) {
        let address = state.account.toLowerCase();
        if (minterState.pool.userAddress.toLowerCase() !== address) {
          minterState.pool.setUserAddress(address);
          updatePool();
        }
      }
    }
    verifyConnectivity()
  }, [ state.account, minterState.minter ])

  async function mintTokens() {
    const { params, minter, input, pool } = minterState;
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
    console.log(await fn.call(opts))
    handleTransaction(fn.send(opts))
      .then(async() =>  await updatePool())
      .catch((() => {}));
  }

  let { inputWidth } = style.getFormatting(state.native);

  return <Dialog
    open={true}
    className={classes.root}
    keepMounted
    TransitionComponent={Transition}
    onClose={toggleDisplay}
  >
    <DialogTitle disableTypography onClose={toggleDisplay}>
      <Typography variant="h6">{t('UniswapMinter')}</Typography>
      {toggleDisplay ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={toggleDisplay}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
    <DialogContent>
      <Grid
        container
        direction='column'
        justify='center'
        alignItems='center'
        alignContent='center'
      >
        <Grid item>
          <DialogContentText>
            {t('UniswapMinterMSG')}
          </DialogContentText>
        </Grid>
        <Grid item>
          {minterState.pool && <SwapInput inputWidth={inputWidth} onSelect={selectToken} tokens={tokenList} useToken={useInput} label={t('swap')} />}
        </Grid>
        <Grid item>
          <Input
            label={t('receive')}
            type='number'
            variant='outlined'
            { ...(useOutput().bindInput) }
            InputProps={{ endAdornment: metadata.symbol }}
            style={{ width: inputWidth }}
          />
        </Grid>
        <Grid item>
          <DialogContentText style={{ fontSize: 'small', whiteSpace: 'pre' }}>
            {message}
          </DialogContentText>
        </Grid>
        <Grid item>
          {
            <Web3RequiredPrimaryButton
              onClick={approvalNeeded ? approveMinter : mintTokens}
              style={approvalNeeded ? { margin: 0 } : { margin: 0, marginBottom: 25 }}
              variant='filled'
              color={approvalNeeded ? 'secondary' : 'primary'}
              label={approvalNeeded ? t('approveMinter') : t('mint')}
              disabled={approvalNeeded ? false : !minterState.ready}
            />
      /*       : <ButtonPrimary onClick={mintTokens} disabled={!minterState.ready} style={{ margin: 0, marginBottom: 25 }} variant='filled' color="primary">
              Mint
            </ButtonPrimary> */
          }
        </Grid>
      </Grid>
    </DialogContent>
  </Dialog>
}

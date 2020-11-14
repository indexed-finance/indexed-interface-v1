import React, { useEffect, useContext } from 'react'

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { toContract } from '../../lib/util/contracts'

import style from '../../assets/css/components/mint'
import getStyles from '../../assets/css'

// import NumberFormat from '../../utils/format'
import ButtonPrimary from '../buttons/primary'
import Input from '../inputs/input'
import TokenInputs from '../inputs/token-inputs';

import { store } from '../../state'
import { useMintState } from '../../state/mint';

const RecieveInput = styled(Input)({
  width: 250,
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

const useStyles = getStyles(style)

export default function Mint({ market, metadata }) {
  const classes = useStyles()
  const { useToken, mintState, bindPoolAmountInput, setHelper, updatePool } = useMintState();

  let { state, handleTransaction } = useContext(store);

  const mint = async () => {
    const abi = require('../../assets/constants/abi/BPool.json').abi;
    const pool = toContract(state.web3.injected, abi, mintState.pool.address);
    let fn;
    if (mintState.isSingle) {
      const token = mintState.tokens[mintState.selectedIndex].address;
      const poolAmountOut = toHex(mintState.poolAmountOut);
      const tokenAmountIn = toHex(mintState.amounts[mintState.selectedIndex]);
      if (mintState.specifiedSide === 'input') {
        fn = pool.methods.joinswapExternAmountIn(token, tokenAmountIn, poolAmountOut);
      } else {
        fn = pool.methods.joinswapPoolAmountOut(token, poolAmountOut, tokenAmountIn);
      }
    } else {
      const maxAmounts = mintState.amounts.map(a => toHex(a));
      const poolAmountOut = toHex((mintState.poolAmountOut));
      fn = pool.methods.joinPool(poolAmountOut, maxAmounts);
    }
    await handleTransaction(fn.send({ from: state.account }))
      .then(async () => {
        updatePool(true);
      }).catch(() => {});
  }

  useEffect(() => {
    const setPool = async() => {
      let poolHelper = state.helper.initialized.find(i => i.pool.address === metadata.address);
      setHelper(poolHelper);
    }
    if (!mintState.pool) setPool();
  }, [ state.web3.injected ])

  return (
    <div className={classes.root}>
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput
          label="RECIEVE"
          variant='outlined'
          type='number'
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{
            endAdornment: market,
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div className={classes.demo}>
          <TokenInputs
            width='100%'
            height='calc(40vh - 75px)'
            useToken={useToken}
            tokens={mintState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Trigger onClick={mint} disabled={!mintState.ready}> MINT </Trigger>
      </Grid>
    </Grid>
    </div>
  );
}

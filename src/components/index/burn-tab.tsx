import React, { useEffect, useContext } from 'react'

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { toContract } from '../../lib/util/contracts'

import NumberFormat from '../../utils/format'
import ButtonPrimary from '../buttons/primary'
import Input from '../inputs/input'

import { store } from '../../state'
import { useBurnState } from '../../state/burn';
import BurnForm from './burn-form';

const RecieveInput = styled(Input)({
  width: 250,
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

export default function BurnTab({ market, metadata }) {
  const { useToken, burnState, bindPoolAmountInput, setHelper, updatePool, displayBalance, setAmountToBalance } = useBurnState();

  let { state, handleTransaction } = useContext(store);

  const burn = async () => {
    const abi = require('../../assets/constants/abi/BPool.json').abi;
    const pool = toContract(state.web3.injected, abi, burnState.pool.address);
    let fn;
    if (burnState.isSingle) {
      const token = burnState.tokens[burnState.selectedIndex].address;
      const poolAmountIn = toHex(burnState.poolAmountIn);
      const tokenAmountOut = toHex(burnState.amounts[burnState.selectedIndex]);
      if (burnState.specifiedSide === 'input') {
        fn = pool.methods.exitswapExternAmountOut(token, tokenAmountOut, poolAmountIn);
      } else {
        fn = pool.methods.exitswapPoolAmountIn(token, poolAmountIn, tokenAmountOut);
      }
    } else {
      const minAmounts = burnState.amounts.map(a => toHex(a));
      const poolAmountIn = toHex((burnState.poolAmountIn));
      fn = pool.methods.exitPool(poolAmountIn, minAmounts);
    }
    await handleTransaction(fn.send({ from: state.account }))
      .then(async () => {
        await updatePool();
      }).catch(() => {});
  }

  useEffect(() => {
    const setPool = async() => {
      let poolHelper = state.helper.initialized.find(i => i.pool.address === metadata.address);
      setHelper(poolHelper);
    }
    if (!burnState.pool) setPool();
  }, [ state.web3.injected ])

  return (
    <div>
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput label="DESTROY" variant='outlined'
          helperText={<span onClick={setAmountToBalance}> BALANCE: {displayBalance} </span>}
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div style={{ borderTop: '2px solid #666666', borderBottom: '2px solid #666666'}}>
        <BurnForm
            width='100%'
            height='40vh'
            useToken={useToken}
            tokens={burnState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <ButtonPrimary onClick={burn} disabled={!burnState.ready} margin={{ marginTop: 25 }}>
          BURN
        </ButtonPrimary>
      </Grid>
    </Grid>
    </div>
  );
}

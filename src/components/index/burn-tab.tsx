import React, { useEffect, useState, useContext } from 'react'

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { toContract } from '../../lib/util/contracts'
import { ZERO_ADDRESS } from '../../assets/constants/addresses'
import NumberFormat from '../../utils/format'
import ButtonPrimary from '../buttons/primary'
import Input from '../inputs/input'

import { store } from '../../state'
import { useBurnState } from '../../state/burn';
import BurnForm from './burn-form';
import style from '../../assets/css/components/mint'

const RecieveInput = styled(Input)({
  width: 250,
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

export default function BurnTab({ market, metadata }) {
  const { useToken, burnState, bindPoolAmountInput, setHelper, updatePool, displayBalance, setAmountToBalance } = useBurnState();
  const [ isInit, setInit ] = useState(false)

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
      const currentTokens = await pool.methods.getCurrentTokens().call();
      const minAmounts = new Array(currentTokens.length).fill(null);
      currentTokens.forEach((address, realIndex) => {
        const localIndex = burnState.tokens.map(t => t.address.toLowerCase()).indexOf(address.toLowerCase());
        minAmounts[realIndex] = toHex(burnState.amounts[localIndex]);
      });
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
      if (!state.helper) return;
      let poolHelper = state.helper.initialized.find(i => i.pool.address === metadata.address);
      if (poolHelper) {
        setHelper(poolHelper);
        setInit(true);
      }
    }
    if (!burnState.pool) setPool();
  }, [ , state.helper, state.indexes ])

  useEffect(() => {
    const verifyConnectivity = async() => {
      if(burnState.pool && (state.web3.injected || window.ethereum) && !burnState.pool.userAddress) {
        await burnState.pool.setUserAddress(state.account)
        await updatePool()
      }
    }
    verifyConnectivity()
  }, [  state.web3.injected, isInit ])

  let { width, height } = style.getFormatting(state.native)

  return (
    <div>
    <Grid container direction='column' alignItems='center' justify='space-around' style={{ width }}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput
          label="DESTROY"
          variant='outlined'
          type='number'
          helperText={<span onClick={setAmountToBalance}> BALANCE: {displayBalance} </span>}
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{
            endAdornment: market
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div style={{ borderTop: '2px solid #666666', borderBottom: '2px solid #666666'}}>
        <BurnForm
            width='100%'
            height={height}
            useToken={useToken}
            tokens={burnState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <ButtonPrimary onClick={burn} disabled={!burnState.ready} margin={{ margin: 25, marginTop: 30, marginLeft: 150 }}>
          BURN
        </ButtonPrimary>
      </Grid>
    </Grid>
    </div>
  );
}

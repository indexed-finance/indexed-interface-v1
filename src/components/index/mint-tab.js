import React, { useEffect, useContext } from 'react'

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { toContract } from '../../lib/util/contracts'

import style from '../../assets/css/components/mint'
import getStyles from '../../assets/css'

import ButtonPrimary from '../buttons/primary'
import Input from '../inputs/input'
import TokenInputs from '../inputs/token-inputs';

import { store } from '../../state'
import { useMintState } from '../../state/mint';
import Slippage from '../inputs/slippage';

const RecieveInput = styled(Input)({
  width: 250,
})

const useStyles = getStyles(style)

export default function Mint({ market, metadata }) {
  const classes = useStyles()
  const { useToken, mintState, bindPoolAmountInput, setHelper, updatePool, setSlippage } = useMintState();

  let { state, handleTransaction } = useContext(store);

  const mint = async () => {
    const abi = require('../../assets/constants/abi/BPool.json').abi;
    const pool = toContract(state.web3.injected, abi, mintState.pool.address);
    let fn;
    if (mintState.isSingle) {
      const token = mintState.tokens[mintState.selectedIndex].address;
      if (mintState.specifiedSide === 'input') {
        const minAmountOut = toHex(mintState.minPoolAmountOut);
        const tokenAmountIn = toHex(mintState.amounts[mintState.selectedIndex]);
        fn = pool.methods.joinswapExternAmountIn(token, tokenAmountIn, minAmountOut);
      } else {
        const poolAmountOut = toHex(mintState.poolAmountOut);
        const maxTokenAmountIn = toHex(mintState.maxAmounts[mintState.selectedIndex]);
        fn = pool.methods.joinswapPoolAmountOut(token, poolAmountOut, maxTokenAmountIn);
      }
    } else {
      const currentTokens = await pool.methods.getCurrentTokens().call();
      const maxAmounts = new Array(currentTokens.length).fill(null);
      currentTokens.forEach((address, realIndex) => {
        const localIndex = mintState.tokens.map(t => t.address.toLowerCase()).indexOf(address.toLowerCase());
        maxAmounts[realIndex] = toHex(mintState.maxAmounts[localIndex]);
      });
      const poolAmountOut = toHex(mintState.poolAmountOut);
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


  let { width } = style.getFormatting(state.native)

  return (
    <Grid container direction='column' alignItems='center' justify='space-around' style={{ width }}>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput
          label="RECIEVE"
          variant='outlined'
          type='number'
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{ endAdornment: market }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div className={classes.demo}>
          <TokenInputs
            width='100%'
            height='40vh'
            useToken={useToken}
            tokens={mintState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Slippage setSlippage={setSlippage} slippage={mintState.slippage} />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <ButtonPrimary onClick={mint} disabled={!mintState.ready} margin={{ marginTop: 7.5 }}>
          MINT
        </ButtonPrimary>
      </Grid>
    </Grid>
  );
}

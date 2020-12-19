import React, { Fragment, useEffect, useContext, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import SwapIcon from '@material-ui/icons/SwapCalls'

import { useSwapState } from "../../state/swap";
import ButtonPrimary from '../buttons/primary'
import Adornment from '../inputs/adornment'
import SwapInput from '../inputs/exchange'
import Input from '../inputs/input'
import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'

const useStyles = getStyles(style)

export default function Swap({ metadata }){
  let { useInput, selectOutput, outputList, tokenList, selectToken, useOutput, swapState,
    setTokens, setHelper, updatePool, switchTokens } = useSwapState()
  const [ tokenMetadata, setTokenMetadata] = useState({})
  const [ isInit, setInit ] = useState(false)
  let { state, dispatch } = useContext(store)
  const classes = useStyles()

  useEffect(() => {
    if(!tokenList && metadata.assets && metadata.assets.length > 0){
      setTokens(metadata.assets)
    }
  }, [ state.indexes, metadata ])

  useEffect(() => {
    if(state.helper && swapState.input.address !== ''){
      let pool = state.helper.initialized.find(i => i.pool.address === metadata.address);

      setHelper(pool)
      setInit(true)
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
  }, [  , state.web3.injected, tokenList ])

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
        <IconButton onClick={!swapState.pool ? () => {} : switchTokens}> <SwapIcon /> </IconButton>
      </Grid>
      <Grid item>
        {swapState.pool && <SwapInput onSelect={selectOutput} tokens={outputList} useToken={useOutput} label='RECIEVE' />}
        {!swapState.pool && <Input label='RECIEVE' variant='outlined' style={{ width: 300 }} InputProps={{ endAdornment: ' ' }} />}
      </Grid>
      <Grid item style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> FEE: <span style={{ marginRight }}> 0.00 </span> </p>
        </div>
      </Grid>
      <Grid item>
        <ButtonPrimary variant='outlined' margin={{  margin: 25, marginLeft: 150 }}>
          SWAP
        </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

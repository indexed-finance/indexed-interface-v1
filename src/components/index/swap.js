import React, { Fragment, useEffect, useContext, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import SwapIcon from '@material-ui/icons/SwapCalls'

import { useSwapState } from "../../state/swap";
import ButtonPrimary from '../buttons/primary'
import Adornment from '../inputs/adornment'
import SwapInput from '../inputs/exchange'
import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'

const useStyles = getStyles(style)

export default function Swap(){
  let { useInput, selectOutput, outputList, tokenList, selectToken, useOutput, swapState,
    setTokens, setHelper, updatePool, switchTokens } = useSwapState()
  const [ tokenMetadata, setTokenMetadata] = useState({})
  let { state, dispatch } = useContext(store)
  const classes = useStyles()

  useEffect(() => {
    const getTokens = async() => {
      let activeIndexes = Object.values(state.indexes)
      let swapList = {}

      if(activeIndexes.length > 0 && !swapState.pool){
        for(let x = 0; x < activeIndexes.length; x++){
          await activeIndexes[x].assets.map((i) => {
            if(!swapList[i.symbol]){
              i.pool = activeIndexes[x].symbol
              swapList[i.symbol] = i
            }
          })
        }
        setTokenMetadata(swapList)
      }
    }
    getTokens()
  }, [ state.indexes ])

  useEffect(() => {
    const availableTokens = Object.values(tokenMetadata)
    let availablePairs = []

    if(!tokenList && availableTokens.length > 0){
      for(let x = 0; x < availableTokens.length; x++){
        availablePairs.push({
          pool: availableTokens[x].pool,
          symbol: availableTokens[x].symbol,
          address: availableTokens[x].address,
          decimals: availableTokens[x].decimals,
        })
      }
      setTokens(availablePairs)
    }
  }, [ tokenMetadata ])

  useEffect(() => {
    if(state.helper && swapState.input.address !== ''){
      let target = Object.values(tokenMetadata).find(i => i.address === swapState.input.address)
      let index = tokenMetadata[target.symbol].pool
      let { address } = state.indexes[index]
      let pool = state.helper.initialized.find(i => i.pool.address === address);

      setHelper(pool)
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

  let { marginRight } = style.getFormatting(state.native)

  return (
    <Grid container direction='column' justify='space-between' alignItems='center'>
      <Grid item>
        {swapState.pool && <SwapInput onSelect={selectToken} tokens={tokenList} useToken={useInput} label='EXCHANGE' />}
      </Grid>
      <Grid item>
        <IconButton onClick={!swapState.pool ? () => {} : switchTokens}> <SwapIcon /> </IconButton>
      </Grid>
      <Grid item>
        {swapState.pool && <SwapInput onSelect={selectOutput} tokens={outputList} useToken={useOutput} label='EXCHANGE' />}
      </Grid>
      <Grid item style={{ width: '100%'}}>
        <div className={classes.market} >
          <p> FEE: <span style={{ marginRight }}> 0.00 </span> </p>
        </div>
      </Grid>
      <Grid item>
        <ButtonPrimary variant='outlined'>
          SWAP
        </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

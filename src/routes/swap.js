import React, { Fragment, useEffect, useContext, useState } from 'react'

import { store } from '../state'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import SwapIcon from '@material-ui/icons/SwapCalls'

import { SwapStateProvider, useSwapState } from "../state/swap";
import ButtonPrimary from '../components/buttons/primary'
import Adornment from '../components/inputs/adornment'
import Container from '../components/container'
import SwapInput from '../components/inputs/exchange'
import style from '../assets/css/routes/swap'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

function Swap(){
  const [ tokenMetadata, setTokenMetadata] = useState({})
  let { useInput, tokenList, useOutput, swapState, setTokens, setHelper, updatePool } = useSwapState()
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
              i.index = activeIndexes[x].symbol
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
          symbol: availableTokens[x].symbol,
          address: availableTokens[x].address,
          decimals: availableTokens[x].decimals
        })
      }
      setTokens(availablePairs)
    }
  }, [ tokenMetadata ])

  useEffect(() => {
    if(state.helper && !!swapState.input.address){
      let target = Object.values(tokenMetadata).find(i => i.address === swapState.input.address)
      let { index } = tokenMetadata[target.symbol]

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

  return (
    <Grid container direction='column' justify='center' alignItems='center'>
      <Grid item>
        <Container margin='6em 0em' padding='1em 3em' title='SWAP'>
          <Grid container direction='column' justify='center' alignItems='center'
            style={{ paddingTop: '1em', paddingBottom: '1em'}}>
            <Grid item>
              {swapState.pool && <SwapInput tokens={tokenList} useToken={useInput} label='EXCHANGE' />}
            </Grid>
            <Grid item>
              <IconButton> <SwapIcon /> </IconButton>
            </Grid>
            <Grid item>
              {swapState.pool && <SwapInput tokens={tokenList} useToken={useOutput} label='EXCHANGE' />}
            </Grid>
            <Grid item>
              <ButtonPrimary variant='outlined' margin={{ marginLeft: 300 }}>
                SWAP
              </ButtonPrimary>
            </Grid>
          </Grid>
       </Container>
     </Grid>
   </Grid>
  )
}

export default function ProviderWrapper(){
  return(
    <SwapStateProvider>
      <Swap />
    </SwapStateProvider>
  )
}

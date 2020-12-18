import React, { Fragment, useEffect, useContext, useState } from 'react'

import { styled } from '@material-ui/core/styles'
import { store } from '../state'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import SwapIcon from '@material-ui/icons/SwapCalls'

import ButtonPrimary from '../components/buttons/primary'
import Adornment from '../components/inputs/adornment'
import Container from '../components/container'
import Input from '../components/inputs/input'
import style from '../assets/css/routes/swap'
import getStyles from '../assets/css'

const TradeInput = styled(Input)({
  '& input': {
    height: 37.5
  }
})

const useStyles = getStyles(style)

export default function Swap(){
  let { state, dispatch } = useContext(store)
  const classes = useStyles()


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
          <Grid container direction='column' justify='center' alignItems='center' style={{ paddingTop: '1em', paddingBottom: '1em'}}>
            <Grid item>
              <TradeInput
                variant='outlined'
                label='EXCHANGE'
                InputProps={{ endAdornment: <Adornment market='YFI' /> }}
                InputLabelProps={{ shrink: true }}
                style={{ marginBottom: 10 }}
                helperText='BALANCE: 0.00'
              />
            </Grid>
            <Grid item>
              <IconButton> <SwapIcon /> </IconButton>
            </Grid>
            <Grid item>
              <TradeInput
                variant='outlined'
                label='RECIEVE'
                InputProps={{ endAdornment: <Adornment market='WBTC' /> }}
                InputLabelProps={{ shrink: true }}
                helperText='BALANCE: 0.00'
              />
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

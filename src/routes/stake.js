import React, { useState, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { usePalette } from 'react-palette'

import style from '../assets/css/routes/stake'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'

import { tokenMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

export default function Stake() {

  let { state, dispatch } = useContext(store)
  let classes = useStyles()

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item md={6}>
        <Container margin='3em 0em' padding="1em 2em" percentage='52.5%' title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake any of the underlying assets of <a> GOVI7a </a> &
              <a> DFI5r </a> to avail to NDX, the offical governance token of Indexed.
              </p>
              <p> TIME REMAINING: 1D 14H 33M 35S </p>
          </div>
        </Container>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas color={(usePalette(tokenMetadata['UNI'].image)).data.vibrant}>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['UNI'].image} style={{ width: 50 }} />
            </div>
            <div className={classes.information}>
              <h2> Uniswap (UNI) </h2>
              <h5> DEPOSITS: $ 5,042,102.45</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 2,530 NDX/DAY </li>
              <li> PARENT(S): GOVI7a, DFI5r </li>
            </ul>
          </div>
          <div className={classes.button}>
            <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
              STAKE
            </ButtonPrimary>
          </div>
        </Canvas>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas color={(usePalette(tokenMetadata['COMP'].image)).data.vibrant}>
          <div className={classes.pool}>
            <div className={classes.information}>
              <div className={classes.image}>
                <img src={tokenMetadata['COMP'].image} style={{ width: 50 }} />
              </div>
              <h2> Compound (COMP) </h2>
              <h5> DEPOSITS: $ 1,434,341.55</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 1,897 NDX/DAY </li>
              <li> PARENT(S): GOVI7a </li>
            </ul>
          </div>
          <div className={classes.button}>
            <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
              STAKE
            </ButtonPrimary>
          </div>
        </Canvas>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas color={(usePalette(tokenMetadata['YFI'].image)).data.vibrant}>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['YFI'].image} style={{ width: 50 }} />
            </div>
            <div className={classes.information}>
              <h2> Yearn (YFI) </h2>
              <h5> DEPOSITS: $ 342,453.55</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 25,666 NDX/DAY </li>
              <li> PARENT(S): GOVI7a, DFI5r </li>
            </ul>
          </div>
          <div className={classes.button}>
            <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
              STAKE
            </ButtonPrimary>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

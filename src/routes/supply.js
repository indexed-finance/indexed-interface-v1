import React, { useState, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { usePalette } from 'react-palette'
import { useParams } from  'react-router-dom'

import style from '../assets/css/routes/supply'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Input from '../components/inputs/input'
import Adornment from '../components/inputs/adornment'
import NumberFormat from '../utils/format'

import { tokenMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const i = {
  'DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK'],
  'UNIV2-ETH-DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK' ],
  'GOVI6': [ 'BAL', 'YFI', 'CRV', 'UNI'],
  'UNIV2-ETH-GOVI6': [ 'UNI', 'YFI', 'CRV', 'BAL']
}

export default function Supply() {
  let { state, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()

  let ticker = asset.toUpperCase()
  let width = ticker.includes('UNIV2') ? 50 : 30
  let marginRight = ticker.includes('UNIV2') ? 7.5 : 0
  let marginBottom = ticker.includes('UNIV2') ? 0 : 10

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        <Canvas>
          <div className={classes.rewards}>
            <p> ACTIVE CLAIM </p>
            <div>
              <h2> 1,235.05334 NDX </h2>
              <ButtonPrimary variant='outlined' margin={{ marginTop: -50 }}>
                CLAIM
              </ButtonPrimary>
            </div>
            <ul className={classes.list}>
              <li> DEPOSIT: 5,352 DFI5r</li>
              <li> RATE: 54.3 NDX/DAY</li>
            </ul>
          </div>
        </Canvas>
      </div>
    </Grid>
      <Grid item xs={10} md={6}>
        <Container margin='1em 0em 1em 0em' padding="1em 2em" title={ticker}>
          <div className={classes.modal}>
            <Grid container direction='row' alignItems='center' justify='space-evenly'>
              <Grid item>
                <img src={tokenMetadata[i[ticker][0]].image} style={{ marginRight, width, marginBottom }} />
                <img src={tokenMetadata[i[ticker][1]].image} style={{marginBottom: 25, width: 30 }} />
                <img src={tokenMetadata[i[ticker][2]].image} style={{ marginLeft: -25, width: 30 }} />
                <img src={tokenMetadata[i[ticker][3]].image} style={{ marginBottom: 10, width: 30 }} />
              </Grid>
              <Grid item>
                <Input label="AMOUNT" variant='outlined'
                  helperText={<o> BALANCE: 0 </o>}
                  name="input"
                  InputProps={{
                    inputComponent: NumberFormat
                  }}
                />
              </Grid>
            </Grid>
            <ul className={classes.estimation}>
              <li> EST REWARD: 0 NDX/DAY </li>
              <li> POOL WEIGHT: 0% </li>
            </ul>
            <ButtonPrimary variant='outlined' margin={{ marginTop: 15, marginRight: 25 }}>
              STAKE
            </ButtonPrimary>
          </div>
        </Container>
      </Grid>
      <Grid item xs={10} md={6}>
        <Canvas>
          <div className={classes.rewards}>
          	<ul className={classes.stats}>
              <li> POOL DEPOSITS: <span> $12,320,411.34 </span> </li>
              <li> POOL RATE: <span> 3,540 NDX/DAY </span> </li>
            </ul>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

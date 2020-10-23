import React, { useState, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { usePalette } from 'react-palette'
import { Link } from  'react-router-dom'

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
              Stake the index tokens <a> GOVI7a </a> & <a> DFI5r </a> or their associated Uniswap liquidity tokens
              <a> UNIV2-ETH-GOVI7a </a> and <a> UNI-V2-ETH-DFI5r </a> to avail of NDX, the offical governance token of Indexed.
              </p>
              <p> TIME REMAINING: 1D 14H 33M 35S </p>
          </div>
        </Container>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['UNI'].image} style={{ width: 30, marginBottom: 10 }} />
              <img src={tokenMetadata['WBTC'].image} style={{marginBottom: 25, width: 30 }} />
              <img src={tokenMetadata['COMP'].image} style={{ marginLeft: -25, width: 30 }} />
              <img src={tokenMetadata['LINK'].image} style={{ marginBottom: 10, width: 30 }} />
            </div>
            <div className={classes.information}>
              <h3> DeFi Index 5 Rebalancer (DFI5r) </h3>
              <h5> DEPOSITS: $ 45,666,102.45</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 2,530 NDX/DAY </li>
              <li> LP's: 350 </li>
            </ul>
          </div>
          <div className={classes.button}>
            <Link to='/supply/dfi5r'>
              <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                STAKE
              </ButtonPrimary>
            </Link>
          </div>
        </Canvas>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas color={(usePalette(tokenMetadata['UNI'].image)).data.vibrant}>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['UNI'].image} style={{ width: 50, marginRight: 5 }} />
              <img src={tokenMetadata['WBTC'].image} style={{marginBottom: 25, width: 25 }} />
              <img src={tokenMetadata['COMP'].image} style={{ marginLeft: -25, width: 25 }} />
              <img src={tokenMetadata['LINK'].image} style={{ marginBottom: 10, width: 25 }} />
            </div>
            <div className={classes.information}>
              <h3> UNIV2-ETH-DFI5r </h3>
              <h5> DEPOSITS: $ 342,453.55</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 46,221 NDX/DAY </li>
              <li> LP's: 150 </li>
            </ul>
          </div>
          <div className={classes.button}>
            <Link to='/supply/univ2-eth-dfi5r'>
              <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                STAKE
              </ButtonPrimary>
            </Link>
          </div>
        </Canvas>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['BAL'].image} style={{ width: 30, marginBottom: 10 }} />
              <img src={tokenMetadata['YFI'].image} style={{marginBottom: 25, width: 30 }} />
              <img src={tokenMetadata['CRV'].image} style={{ marginLeft: -25, width: 30 }} />
              <img src={tokenMetadata['UNI'].image} style={{ marginBottom: 10, width: 30 }} />
            </div>
            <div className={classes.information}>
              <h3> Governance Index 6 (GOVI6) </h3>
              <h5> DEPOSITS: $ 2,555,298.20</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 10,530 NDX/DAY </li>
              <li> LP's: 769 </li>
            </ul>
          </div>
          <div className={classes.button}>
            <Link to='/supply/govi6'>
              <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                STAKE
              </ButtonPrimary>
            </Link>
          </div>
        </Canvas>
      </Grid>
      <Grid item md={6} style={{ width: '100%' }}>
        <Canvas color={(usePalette(tokenMetadata['UNI'].image)).data.vibrant}>
          <div className={classes.pool}>
            <div className={classes.image}>
              <img src={tokenMetadata['UNI'].image} style={{ width: 50, marginRight: 5 }} />
              <img src={tokenMetadata['BAL'].image} style={{marginBottom: 25, width: 25 }} />
              <img src={tokenMetadata['YFI'].image} style={{ marginLeft: -25, width: 25 }} />
              <img src={tokenMetadata['CRV'].image} style={{ marginBottom: 10, width: 25 }} />
            </div>
            <div className={classes.information}>
              <h3> UNIV2-ETH-GOVI6 </h3>
              <h5> DEPOSITS: $ 150,331.44</h5>
            </div>
            <ul style={{ float: 'left', listStyle: 'none', padding: 0}}>
              <li> RATE: 53,331 NDX/DAY </li>
              <li> LP's: 86 </li>
            </ul>
          </div>
          <div className={classes.button}>
            <Link to='/supply/univ2-eth-govi6'>
              <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                STAKE
              </ButtonPrimary>
            </Link>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

import React, { useState, useEffect, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { usePalette } from 'react-palette'
import { Link } from  'react-router-dom'

import IERC20 from '../assets/constants/abi/IERC20.json'

import style from '../assets/css/routes/stake'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'

import { tokenMetadata } from '../assets/constants/parameters'
import { toContract } from '../lib/util/contracts'
import { getStakingPools } from '../api/gql'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const i = {
  'DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK'],
  'UNIV2:ETH-DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK' ],
  'GOVI6': [ 'BAL', 'YFI', 'CRV', 'UNI'],
  'UNIV2:ETH-GOVI6': [ 'UNI', 'YFI', 'CRV', 'BAL']
}

export default function Stake() {
  const [ pools, setPools ] = useState([])
  let { state, dispatch } = useContext(store)
  let classes = useStyles()

  useEffect(() => {
    const getPools = async() => {
      let { web3 } = state
      let data = await getStakingPools()

      for(let value in data){
        let { stakingToken, indexPool } = data[value]
        let staking = toContract(web3.rinkeby, IERC20.abi, stakingToken)
        let index = toContract(web3.rinkeby, IERC20.abi, indexPool)
        let stakingSymbol = await staking.methods.symbol().call()
        let stakingName = await staking.methods.name().call()
        let indexSymbol = await index.methods.symbol().call()
        let indexName = await index.methods.name().call()
        let symbol = ''
        let name = ''

        if(indexSymbol == stakingSymbol){
          symbol = indexSymbol
          name = indexName
        } else {
          symbol = `UNIV2:ETH-${indexSymbol}`
          name = stakingName
        }

        data[value] = { ...data[value], symbol, name }
      }

      setPools(data)
    }
    getPools()
  }, [])

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={6}>
        <Container margin='3em 0em' padding="1em 2em" title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake the index tokens <a> GOVI7a </a> & <a> DFI5r </a> or their associated Uniswap liquidity tokens
              <a> UNIV2-ETH-GOVI7a </a> and <a> UNI-V2-ETH-DFI5r </a> to avail of NDX, the offical governance token of Indexed.
              </p>
              <p> TIME REMAINING: </p>
              <h3> 1D 14H 33M 35S </h3>
          </div>
        </Container>
      </Grid>
      {pools.map(p => {
        let { symbol, name, rewardRate, isReady } = p
        let color  = symbol.includes('UNIV2') ? '#fc1c84' : ''
        let width = symbol.includes('UNIV2') ? 25 : 30
        let mainWidth = symbol.includes('UNIV2') ? 50 : 30
        let marginRight = symbol.includes('UNIV2') ? 5 : 0
        let rate = (parseFloat(rewardRate)/Math.pow(10, 18))
        let ticker = symbol.toUpperCase()
        let label = isReady ? 'STAKE' : 'INITIALIZE'

        return(
          <Grid item xs={10} md={6} style={{ width: '100%' }}>
            <Link className={classes.href} to={`/stake/${symbol.toLowerCase()}`}>
              <Canvas button color={color}>
                <div className={classes.pool}>
                  <div className={classes.image}>
                    <img src={tokenMetadata[i[ticker][0]].image} style={{ width: mainWidth, marginRight }} />
                    <img src={tokenMetadata[i[ticker][1]].image} style={{marginBottom: 25, width }} />
                    <img src={tokenMetadata[i[ticker][2]].image} style={{ marginLeft: -25, width }} />
                    <img src={tokenMetadata[i[ticker][3]].image} style={{ marginBottom: 10, width }} />
                  </div>
                  <div className={classes.information}>
                    <h3> {name} [{symbol}] </h3>
                    <h5> DEPOSITS: $ 0</h5>
                  </div>
                  <ul className={classes.list}>
                    <li> RATE: {rate.toFixed(2)} NDX/DAY </li>
                    <li> LP's: 0 </li>
                  </ul>
                </div>
                <div className={classes.button}>
                  <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                    {label}
                  </ButtonPrimary>
                </div>
              </Canvas>
            </Link>
          </Grid>
        )
      })}
    </Grid>
  )
}

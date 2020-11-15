import React, { useState, useEffect, useContext, Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import { Link } from  'react-router-dom'
import Countdown from 'react-countdown'
import ContentLoader from "react-content-loader"
import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'

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

const DATE_END = 1605586873688

const i = {
  'GOV5r': [ 'BAL', 'YFI', 'CRV', 'UNI'],
  'UNIV2:ETH-GOV5r': [ 'UNI', 'YFI', 'CRV', 'BAL']
}

const MyLoader = ({theme, width}) => (
  <ContentLoader
    speed={2}
    width={width}
    height={875}
    viewBox={`0 0 ${width} 875`}
    backgroundColor={theme.palette.primary.main}
    foregroundColor='rgba(153, 153, 153, 0.5)'
  >
    <rect x="0" y="0" rx="5" ry="5" width={width} height="200" />
    <rect x="0" y="225" rx="5" ry="5" width={width} height="200" />
    <rect x="0" y="450" rx="5" ry="5" width={width} height="200" />
    <rect x="0" y="675" rx="5" ry="5" width={width} height="200" />
  </ContentLoader>
)

export default function Stake() {
  const [ pools, setPools ] = useState([])
  let { state, dispatch } = useContext(store)
  let theme =  useTheme()
  let classes = useStyles()

  useEffect(() => {
    const getPools = async() => {
      let { web3 } = state
      let data = await getStakingPools()

      console.log(data)

      for(let value in data){
        let { id, stakingToken, indexPool } = data[value]
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
              <a> UNIV2:ETH-GOVI7a </a> and <a> UNIV2:ETH-DFI5r </a> to avail of NDX, the offical governance token of Indexed.
              </p>
              <p> TIME REMAINING: </p>
              <h3> <Countdown date={DATE_END} /> </h3>
          </div>
        </Container>
      </Grid>
      {pools.length > 0 && pools.map(p => {
        let { symbol, name, rewardRate, isReady, totalSupply } = p
        let color  = symbol.includes('UNIV2') ? '#fc1c84' : ''
        let width = symbol.includes('UNIV2') ? 25 : 30
        let mainWidth = symbol.includes('UNIV2') ? 50 : 30
        let marginRight = symbol.includes('UNIV2') ? 5 : 0
        let rate = (parseFloat(rewardRate)/parseFloat(totalSupply))
        let label = isReady ? 'STAKE' : 'INITIALIZE'
        let supply = parseFloat(totalSupply)/Math.pow(10,18)
        supply = supply.toLocaleString({ minimumFractionDigits: 2 })

        console.log(isReady)

        if(parseFloat(totalSupply) == 0){
          rate = (parseFloat(rewardRate)/Math.pow(10, 18))
        }

        rate = parseFloat(rate * 60 * 24).toLocaleString()

        return(
          <Grid item xs={10} md={6} style={{ width: '100%' }}>
            <Link className={classes.href} to={`/stake/${symbol.toLowerCase()}`}>
              <Canvas button color={color}>
                <div className={classes.pool}>
                  <div className={classes.image}>
                    <img src={tokenMetadata[i[symbol][0]].image} style={{ width: mainWidth, marginRight }} />
                    <img src={tokenMetadata[i[symbol][1]].image} style={{marginBottom: 25, width }} />
                    <img src={tokenMetadata[i[symbol][2]].image} style={{ marginLeft: -25, width }} />
                    <img src={tokenMetadata[i[symbol][3]].image} style={{ marginBottom: 10, width }} />
                  </div>
                  <div className={classes.information}>
                    {!state.native && (
                      <Fragment>
                        <h3> {name} [{symbol}] </h3>
                        <h5> DEPOSITS: {supply} {symbol}</h5>
                      </Fragment>
                    )}
                    {state.native && (
                      <Fragment>
                        <h4> {symbol} </h4>
                        <h5> DEPOSITS: {supply}</h5>
                      </Fragment>
                    )}
                  </div>
                  <ul className={classes.list}>
                    <li> RATE: {rate} NDX/DAY </li>
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
      {pools.length == 0 && (
        <Grid item xs={10} md={6} style={{ width: '100%' }}>
          <ParentSize>
            {({ width, height }) => (
              <MyLoader width={width} theme={theme} />
            )}
          </ParentSize>
        </Grid>
      )}
    </Grid>
  )
}

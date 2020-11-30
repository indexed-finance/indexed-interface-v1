import React, { useState, useEffect, useContext, Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import { Link } from  'react-router-dom'
import Countdown from 'react-countdown'
import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { formatBalance, BigNumber } from '@indexed-finance/indexed.js'
import IERC20 from '../assets/constants/abi/IERC20.json'

import style from '../assets/css/routes/stake'
import Card from '../components/card'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Loader from '../components/loaders/stake'

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

export default function Stake() {
  const [ pools, setPools ] = useState([])
  let { state, dispatch } = useContext(store)
  let theme =  useTheme()
  let classes = useStyles()

  useEffect(() => {
    const getPools = async() => {
      let { web3 } = state
      let data = await getStakingPools()

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
        let rate = (parseFloat(rewardRate)/parseFloat(totalSupply))
        let supply = formatBalance(new BigNumber(totalSupply), 18, 4)
        let color  = symbol.includes('UNIV2') ? '#fc1c84' : ''
        let mainWidth = symbol.includes('UNIV2') ? 50 : 30
        let marginRight = symbol.includes('UNIV2') ? 5 : 0
        let width = symbol.includes('UNIV2') ? 25 : 30
        let label = isReady ? 'STAKE' : 'INITIALIZE'

        if(parseFloat(totalSupply) == 0){
          rate = formatBalance(new BigNumber(rewardRate), 18, 4)
        }

        supply = supply.toLocaleString({ minimumFractionDigits: 2 })
        rate = parseFloat(rate * 60 * 24).toLocaleString()

        return(
          <Grid item xs={10} md={6} style={{ width: '100%' }}>
            <Link className={classes.href} to={`/stake/${symbol.toLowerCase()}`}>
              <Card color={color}>
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
                  <ButtonPrimary variant='outlined'
                   margin={{ marginBottom: 25, marginRight: 25 }}>
                    {label}
                  </ButtonPrimary>
                </div>
              </Card>
            </Link>
          </Grid>
        )
      })}
      {pools.length == 0 && (
        <Grid item xs={10} md={6} style={{ width: '100%' }}>
          <ParentSize>
            {({ width, height }) => (
              <Loader width={width} theme={theme} />
            )}
          </ParentSize>
        </Grid>
      )}
    </Grid>
  )
}

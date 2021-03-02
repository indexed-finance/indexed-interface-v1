import React, { Fragment, useContext, useMemo } from 'react'
import cloneDeep from 'lodash.clonedeep'

import Grid from '@material-ui/core/Grid'
import { Link } from  'react-router-dom'
import Countdown from 'react-countdown'
import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { formatBalance, toWei } from '@indexed-finance/indexed.js'

import style from '../assets/css/routes/stake'
import Card from '../components/card'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Loader from '../components/loaders/stake'

import { categoryMetadata, getTokenImage, tokenMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { useStakingState } from '../state/staking/context';
import { store } from '../state'

const useStyles = getStyles(style)

export default function Stake() {
  const theme =  useTheme()
  const classes = useStyles()
  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  let reducerState = useStakingState();
  let { state } = useContext(store);

  let { margin, buttonMargin } = style.getFormatting(state)

  const getPoolStyles = (symbol) => {
    const isWethPair = symbol.includes('UNIV2')

    if(isWethPair) return {
      color: '#fc1c84',
      mainWidth: 50,
      marginRight: 5,
      showUni: true,
      width: 25,
    }
    else return {
      color: '',
      mainWidth: 30,
      marginRight: 0,
      showUni: false,
      width: 30
    }
  }

  const getPoolLabel = (a, b, c) => {
    if(a) return 'STAKE'
    else if(b) return 'VIEW'
    else if(c) return 'INITIALIZE'
    return ''
  }

  const { pools } = reducerState;
  const reversed = cloneDeep(pools).reverse();

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={6} lg={6} xl={6} >
        <Container margin={margin} padding="1em 2em" title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake index tokens or their associated Uniswap liquidity tokens to earn NDX, the governance token for Indexed Finance.
            </p>
            <a href='https://ndxfi.medium.com/how-to-mint-and-stake-index-pool-tokens-5c21a08706ce' target='_blank' >Read More</a>
          </div>
        </Container>
      </Grid>
      {
        reducerState.pools.length > 0 &&
        reversed.map((pool) => {
          const { isReady, hasBegun, active, address, totalSupply, claimedRewards, rewardRate, periodStart, totalRewards } = pool.pool;
          
          const displaySupply = parseFloat(formatBalance(totalSupply, 18, 4));
          const meta = reducerState.metadata[address];
          function getAPY() {
            const tokenPrice = reducerState.stakingTokenPrices && reducerState.stakingTokenPrices[pool.stakingToken];
            const ndxPrice = reducerState.ndxPrice;
            if (!tokenPrice || !ndxPrice) return undefined;
            const ndxMinedPerDay = parseFloat(formatBalance(pool.pool.rewardRate.times(86400), 18, 4));
            const valueNdxPerYear = ndxMinedPerDay * 365 * ndxPrice;
            const totalStakedValue = displaySupply * tokenPrice;
            return ((valueNdxPerYear / totalStakedValue) * 100).toFixed(2);
          }
          const apy = getAPY()
          let rate = formatBalance(rewardRate.times(86400), 18, 0);

          let total = parseFloat(formatBalance(totalRewards, 18, 4));
          let symbol = '', name = '', tokens = [];
          let category = '';
          if (meta) {
            // tokens = meta.indexPoolTokenSymbols.slice(0 , 4);
            // tokens = meta.
            symbol = meta.stakingSymbol;
            name = meta.indexPoolName
            category = meta.poolCategory;
          }

          let formattedName = name.replace(/Tokens/g, ' ')
          let { mainWidth, width, color, marginRight, showUni } = getPoolStyles(symbol)

          if(showUni) {
            let findExisting = tokens.find(i => i === 'UNI')

            if(findExisting) {
              tokens[tokens.indexOf(findExisting)] = tokens[0]
              tokens[0] = findExisting
            } else {
              tokens[0] = 'UNI'
            }
          }

          const imgStyles = [
            { width: mainWidth, marginRight },
            { marginBottom: 25, width },
            { marginLeft: -25, width },
            { marginBottom: 10, width }
          ];

          function Button() {
            return (
              <ButtonPrimary variant='outlined' margin={buttonMargin}>
               {getPoolLabel(active, hasBegun, isReady)}
             </ButtonPrimary>
            )
          }

          function Status() {
            if (!isReady) {
              return <h5>BEGINS IN <Countdown data={periodStart * 1000} /></h5>
            }
            if (active) {
              return <div className={classes.status}>
                <h5>STAKED: {displaySupply.toLocaleString()} {state.native ? '' : symbol}</h5>
                <h5 style={{ color: '#00e79a' }}>APY: {apy}%</h5>
              </div>
            }
            if (hasBegun) {
              return <h5>STAKING FINISHED</h5>
            }
            return state.native ? <h5>READY TO BEGIN</h5> : <h5>READY</h5>
          }

          function Content() {
            if (!isReady) {
              return <ul className={classes.list}>
                <li> BEGINS IN <Countdown data={periodStart * 1000} /> </li>
                <li> TOTAL: {total.toLocaleString()} NDX </li>
              </ul>
            }
            if (active) {
              return <ul className={classes.list}>
                <li> RATE: {rate.toLocaleString()} NDX/DAY </li>
                <li> TOTAL: {total.toLocaleString()} NDX </li>
              </ul>
            }
            if (hasBegun) {
              return <ul className={classes.list}>
                <li> RATE: {rate.toLocaleString()} NDX/DAY </li>
                <li> TOTAL: {total.toLocaleString()} NDX </li>
              </ul>
            }
            return <ul className={classes.list}>
              <li> CAN BE INITIALIZED </li>
              <li> AVAILABLE: {total.toLocaleString()} NDX </li>
            </ul>
          }

          return(
            <Grid item xs={10} md={6} lg={6} xl={6} style={{ width: '100%' }}>
              <Link className={classes.href} to={`/stake/${symbol.toLowerCase()}`}>
                <Card color={color}>
                  <div className={classes.pool}>
                    <div className={classes.image}>
                      { category && <img alt={`asset-2`} src={categoryMetadata[category]?.normal[mode]} style={imgStyles[2]} /> }
                      { showUni && <img alt={`asset-3`} src={tokenMetadata['ETH'].image} style={imgStyles[3]} /> }
                    </div>
                    <div className={classes.information}>
                      <Fragment>
                        <h4> {!state.native ? `${formattedName} [${symbol}]` : symbol} </h4>
                        { Status() }
                      </Fragment>
                    </div>
                    { Content() }
                  </div>
                  <div className={classes.button}>
                    { Button() }
                  </div>
                </Card>
              </Link>
            </Grid>
          )
        })
      }
      {!reducerState.pools.length && (
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

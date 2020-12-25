import React, { Fragment } from 'react'

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

import { tokenMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { useStakingState } from '../state/staking/context';

const useStyles = getStyles(style)

export default function Stake() {
  const theme =  useTheme()
  const classes = useStyles()

  let state = useStakingState();

  let { margin } = style.getFormatting(state)

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={6} lg={6} xl={6} >
        <Container margin={margin} padding="1em 2em" title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake index tokens or their associated Uniswap liquidity tokens to earn NDX, the governance token for Indexed Finance.
            </p>
            Staking will begin later this month. Join us on <a href='https://discord.gg/jaeSTNPNt9' target='_blank'>Discord</a> or follow us on <a href='https://twitter.com/ndxfi' target='_blank'>Twitter</a> for updates.
          </div>
        </Container>
      </Grid>
      {
        state.pools.length > 0 &&
        state.pools.map((pool) => {
          const { isReady, hasBegun, active, address, totalSupply, claimedRewards, rewardRate, periodStart, totalRewards } = pool.pool;
          const meta = state.metadata[address];
          const displaySupply = formatBalance(totalSupply, 18, 4);
          const claimed = formatBalance(claimedRewards, 18, 4);
          let supply = totalSupply.eq(0) ? toWei(1) : totalSupply
          let rate = formatBalance(
            rewardRate.times(86400).times(toWei(1)).div(supply),
            18,
            0
          );
          let total = formatBalance(totalRewards, 18, 4);
          let symbol = '', name = '', tokens = [];
          if (meta) {
            name = meta.indexPoolName;
            symbol = meta.stakingSymbol;
            tokens = meta.indexPoolTokenSymbols;
          }

          let color  = symbol.includes('UNIV2') ? '#fc1c84' : ''
          let mainWidth = symbol.includes('UNIV2') ? 50 : 30
          let marginRight = symbol.includes('UNIV2') ? 5 : 0
          let width = symbol.includes('UNIV2') ? 25 : 30
          let label = isReady ? 'STAKE' : 'INITIALIZE'

          const imgStyles = [
            { width: mainWidth, marginRight },
            { marginBottom: 25, width },
            { marginLeft: -25, width },
            { marginBottom: 10, width }
          ];

          function Button() {
            if (active) {
              return <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
               STAKE
             </ButtonPrimary>
            }
            if (hasBegun) {
              return <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
               VIEW
             </ButtonPrimary>
            }
            if (isReady) {
              return <ButtonPrimary variant='outlined' margin={{ marginBottom: 25, marginRight: 25 }}>
                INITIALIZE
              </ButtonPrimary>
            }
            return <></>
          }

          function Status() {
            if (!isReady) {
              return <h5>BEGINS IN <Countdown data={periodStart * 1000} /></h5>
            }
            if (active) {
              return <h5>STAKED: {displaySupply} {state.native ? '' : symbol}</h5>
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
                <li> TOTAL: {total} NDX </li>
              </ul>
            }
            if (active) {
              return <ul className={classes.list}>
                <li> RATE: {rate} NDX/DAY </li>
                <li> LP's: 0 </li>
              </ul>
            }
            if (hasBegun) {
              return <ul className={classes.list}>
                <li> CLAIMED: {claimed} NDX </li>
                <li> TOTAL: {total} NDX </li>
              </ul>
            }
            return <ul className={classes.list}>
              <li> CAN BE INITIALIZED </li>
              <li> AVAILABLE: {parseInt(total)} NDX </li>
            </ul>
          }

          return(
            <Grid item xs={10} md={6} lg={6} xl={6} style={{ width: '100%' }}>
              <Link className={classes.href} to={`/stake/${symbol.toLowerCase()}`}>
                <Card color={color}>
                  <div className={classes.pool}>
                    <div className={classes.image}>
                      {
                        tokens.slice(0, 4).map(
                          (symbol, i) => <img alt={`asset-${i}`} src={tokenMetadata[symbol].image} style={imgStyles[i]} />
                        )
                      }
                    </div>
                    <div className={classes.information}>
                      {!state.native && (
                        <Fragment>
                          <h3> {name} [{symbol}] </h3>
                          { Status() }
                        </Fragment>
                      )}
                      {state.native && (
                        <Fragment>
                          <h4> {symbol} </h4>
                          { Status() }
                        </Fragment>
                      )}
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
      {!state.pools.length && (
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

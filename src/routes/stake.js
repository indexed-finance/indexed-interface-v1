import React, { Fragment, useContext, useMemo } from 'react'
import cloneDeep from 'lodash.clonedeep'

import Grid from '@material-ui/core/Grid'
import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'

import style from '../assets/css/routes/stake'
import Card from '../components/card'
import Container from '../components/container'
import Loader from '../components/loaders/stake'

import getStyles from '../assets/css'
import { useStakingState } from '../state/staking/context';
import { store } from '../state'
import StakingCard from '../components/StakingCard'
import NewStakingCard from '../components/NewStakingCard'

import { useNewStakingState } from '../state/new-staking/context'

const useStyles = getStyles(style)

export default function Stake() {
  const theme =  useTheme()
  const classes = useStyles()

  let reducerState = useStakingState();
  let newReducerState = useNewStakingState();
  console.log()
  let { state } = useContext(store);

  let { margin, spacing } = style.getFormatting(state)

  const { pools } = reducerState;
  const reversed = cloneDeep(pools).reverse();
  const legacyActive = reversed.filter(pool => pool.pool.active);
  const legacyExpired = reversed.filter(pool => !pool.pool.active);

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={6} lg={6} xl={6}>
        <Container margin={margin} padding="1em 2em" title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake index tokens or their associated Uniswap liquidity tokens to earn NDX, the governance token for Indexed Finance.
            </p>
            <p style={{ color: 'rgb(252, 28, 132)' }}>
              We've updated our staking contracts - <a href='https://ndxfi.medium.com/ae30a0470001' target='_blank' rel='noopener noreferrer' >read more here</a>
            </p>
          </div>
        </Container>
      </Grid>
      <Grid item container direction='row' spacing={spacing} xs={10} md={10} lg={10} xl={10}>
        {
          newReducerState.helper &&
          newReducerState.helper.pools.length > 0 &&
            newReducerState.helper.pools.map((pool, i) => <NewStakingCard
              key={i}
              helper={newReducerState.helper}
              category={newReducerState.categories[pool.token] || ''}
              pool={pool}
              ndxPrice={newReducerState.ndxPrice}
              stakingTokenPrices={newReducerState.stakingTokenPrices}
            />)
          }
          {
            legacyActive.length > 0 &&
            legacyActive.map((pool, i) => <StakingCard
              key={i}
              meta={reducerState.metadata[pool.pool.address]}
              pool={pool}
              ndxPrice={reducerState.ndxPrice}
              stakingTokenPrices={reducerState.stakingTokenPrices}
            />)
          }
      </Grid>

      <Grid item xs={10} md={6} lg={6} xl={6} >
        <Container margin={margin} padding="1em 2em" title='Legacy Staking Pools'>
          <div className={classes.header}>
            <p>
              These staking pools have expired, you should withdraw your tokens and use the newer contracts.
            </p>
          </div>
        </Container>
      </Grid>

      <Grid item container direction='row' spacing={spacing} xs={10} md={10} lg={10} xl={10}>
      {
        legacyExpired.length > 0 &&
        legacyExpired.map((pool, i) => <StakingCard
          key={i}
          meta={reducerState.metadata[pool.pool.address]}
          pool={pool}
          ndxPrice={reducerState.ndxPrice}
          stakingTokenPrices={reducerState.stakingTokenPrices}
        />)
      }
      </Grid>

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

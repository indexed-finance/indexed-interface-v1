import React, { Fragment, useContext, useMemo } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Link } from  'react-router-dom'
import Countdown from 'react-countdown'
import { formatBalance, NewStakingHelper, StakingPoolHelper } from '@indexed-finance/indexed.js'

import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/stake'
import Card from './card'
import ButtonPrimary from './buttons/primary'
import Loader from './loaders/stake'
import getStyles from '../assets/css'
import { store } from '../state'
import { NewStakingPool } from '@indexed-finance/indexed.js/dist/new-staking/types'

const useStyles = getStyles(style)

type Props = {
  helper: NewStakingHelper;
  pool: NewStakingPool;
  ndxPrice: number | undefined;
  stakingTokenPrices: { [token: string]: number } | undefined;
  key: any;
  category?: string;
}

export default function NewStakingCard({
  helper,
  pool,
  stakingTokenPrices,
  ndxPrice,
  key,
  category
}: Props) {
  let { state } = useContext(store);
  const { name, symbol, totalStaked } = pool;
  
  // const { isReady, hasBegun, active, totalSupply, rewardRate, periodStart, totalRewards } = pool;

  const theme = useTheme()

  const classes: any = useStyles()

  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  const displaySupply = parseFloat(formatBalance(totalStaked, 18, 4));

  let { buttonMargin } = style.getFormatting(state)

  const getPoolStyles = (symbol) => {
    const isWethPair = symbol.includes('-')

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
  const apy = useMemo(() => {
    const tokenPrice = stakingTokenPrices && stakingTokenPrices[pool.token];
    if (!tokenPrice || !ndxPrice) return 0;
    if (!helper.totalRewardsPerDay || !pool.rewardsPerDay || !pool.totalStaked) return 0;
    const ndxMinedPerDay = parseFloat(formatBalance(
      helper.calculateRewardsForDuration(+(pool.id), 86400, pool.totalStaked),
      18,
      6
    ));
    // console.log(``)
    const valueNdxPerYear = ndxMinedPerDay * 365 * ndxPrice;
    console.log(`NDX Mined Per Day ${ndxMinedPerDay} || NDX Price ${ndxPrice} || Value ${ndxMinedPerDay * ndxPrice}`)
    // console.log(`Value Rewards Per Day ${valueNdxPerYear}`)
    const totalStakedValue = parseFloat(formatBalance(pool?.totalStaked, 18, 6)) * tokenPrice;
    console.log(`Value Staked ${totalStakedValue}`)
    return ((valueNdxPerYear / totalStakedValue) * 100).toFixed(2);
  }, [helper, stakingTokenPrices, ndxPrice, pool])

  let total = parseFloat(formatBalance(pool.rewardsPerDay, 18, 4));

  let formattedName = name.replace(/Tokens/g, ' ')
  let { mainWidth, width, color, marginRight, showUni } = getPoolStyles(symbol)

  const imgStyles = [
    { width: mainWidth, marginRight },
    { marginBottom: 25, width },
    { marginLeft: -25, width },
    { marginBottom: 10, width }
  ];

  function Button() {
    return (
      <ButtonPrimary variant='outlined' margin={buttonMargin}>
        STAKE
      </ButtonPrimary>
    )
  }

  function Status() {
    return <div className={classes.status}>
      <h5> STAKED: {displaySupply.toLocaleString()} {state.native ? '' : symbol}</h5>
      <h5 style={{ color: '#00e79a' }}>APY: {apy}%</h5>
      <h4 style={{ marginTop: 20 }}>RATE: {total.toLocaleString()} NDX/DAY</h4>
    </div>
  }

  return(
    <Grid item xs={12} sm={12} md={12} lg={6} xl={6} key={key}>
      <Card color={color} className={classes.card}>
        <Link className={classes.href}  to={`/stake/${symbol.toLowerCase()}`}>
          <div className={classes['pool']}>
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
          </div>
        </Link>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              shapeOutside: 'inset(calc(100% - 100px) 0 0)'
            }}>
              { Button() }
            </div>
      </Card>
    </Grid>
  )
}
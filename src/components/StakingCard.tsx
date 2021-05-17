import React, { Fragment, useContext } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Link } from  'react-router-dom'
import Countdown from 'react-countdown'
import { formatBalance, StakingPoolHelper } from '@indexed-finance/indexed.js'

import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/stake'
import Card from './card'
import ButtonPrimary from './buttons/primary'
import Loader from './loaders/stake'
import { StakingPoolMetadata } from '../state/staking/reducer'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

type Props = {
  pool: StakingPoolHelper;
  meta: StakingPoolMetadata;
  ndxPrice: number | undefined;
  stakingTokenPrices: { [token: string]: number } | undefined;
  key: any;
}

export default function StakingCard({
  pool,
  meta,
  stakingTokenPrices,
  ndxPrice,
  key
}: Props) {
  let { state } = useContext(store);
  const { isReady, hasBegun, active, totalSupply, rewardRate, periodStart, totalRewards } = pool.pool;

  const theme = useTheme()

  const classes: any = useStyles()

  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  const displaySupply = parseFloat(formatBalance(totalSupply, 18, 4));

  let { buttonMargin } = style.getFormatting(state)

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

  function getAPY() {
    const tokenPrice = stakingTokenPrices && stakingTokenPrices[pool.stakingToken];
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
      return <h5>BEGINS IN <Countdown date={periodStart * 1000} /></h5>
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
      return <Fragment>
        <h4> BEGINS IN <Countdown date={periodStart * 1000} /> </h4>
        <h4> TOTAL: {total.toLocaleString()} NDX </h4>
      </Fragment>
    }
    if (active) {
      return <Fragment>
        <h4> RATE: {rate.toLocaleString()} NDX/DAY </h4>
        <h4> TOTAL: {total.toLocaleString()} NDX </h4>
      </Fragment>
    }
    if (hasBegun) {
      return <Fragment>
        <h4> RATE: {rate.toLocaleString()} NDX/DAY </h4>
        <h4> TOTAL: {total.toLocaleString()} NDX </h4>
      </Fragment>
    }
    return <Fragment>
      <h4> CAN BE INITIALIZED </h4>
      <h4> AVAILABLE: {total.toLocaleString()} NDX </h4>
    </Fragment>
  }

  return(
    <Grid item xs={12} sm={12} md={12} lg={6} xl={6} key={key}>
      <Card color={color} className={classes.card}>
        <Link className={classes.href} to={`/stake-old/${symbol.toLowerCase()}`}>
          <div className={classes['pool']}>
            <div className={classes.image}>
              { category && <img alt={`asset-2`} src={categoryMetadata[category]?.normal[mode]} style={imgStyles[2]} /> }
              { showUni && <img alt={`asset-3`} src={tokenMetadata['ETH'].image} style={imgStyles[3]} /> }
            </div>
            <div className={classes.information}>
              <Fragment>
                <h4> {!state.native ? `${formattedName} [${symbol}]` : symbol} </h4>
                { Status() }
                { Content() }
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
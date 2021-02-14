import React, { Fragment, useState, useContext, useEffect } from 'react'

import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { useParams } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'

import ButtonMarket from '../components/buttons/market'
import TradeTab from '../components/index/trade-tab'
import Mint from '../components/index/mint-tab'
import Burn from '../components/index/burn-tab'
import Tabs from '../components/index/tabs'
import Swap from '../components/index/swap'

import style from '../assets/css/routes/index'
import { categoryMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { store } from '../state'
import { MintStateProvider } from '../state/mint'
import { SwapStateProvider } from '../state/swap'
import { BurnStateProvider } from '../state/burn';
import { TradeStateProvider } from '../state/trade'
import TitleLoader from '../components/loaders/title'
import Loader from '../components/loaders/area'
import IndexChartContainer from '../components/charts/IndexChartContainer'
import Delta from '../components/utils/delta'
import { useTranslation } from 'react-i18next'

const selected = {
  color: 'white',
  background: '#666666'
}

const useStyles = getStyles(style)

export default function Index(){
  let { state, dispatch } = useContext(store)
  let { name } = useParams()

  name = name.toUpperCase()

  const [ styles, setStyles ] = useState({ trade: selected, mint: {}, burn: {}, swap: {}})
  const [ metadata, setMetadata ] = useState({})
  const [ execution, setExecution ] = useState('trade')
  const [ duration, setDuration ] = useState('day');
  const [ yAxisKey, setYAxisKey ] = useState('value');

  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation()
  const changeExecution = (option) => {
    let newStyle = clearSelections()

    if(option === 'burn') {
      newStyle.burn = selected;
    } else if(option === 'mint'){
      newStyle.mint = selected
    } else if(option === 'swap'){
      newStyle.swap = selected
    } else {
      newStyle.trade = selected
    }

    setStyles(newStyle)
    setExecution(option)
  }

  const clearSelections = () => {
    return {
      trade: {}, mint: {}, burn: {}, swap: {}
    }
  }

  useEffect(() => {
    const getMetadata = async() => {
      let { indexes, account } = state
      let emptyMetadata = Object.keys(metadata).length === 0;

      if(Object.keys(indexes).length > 0){
        setMetadata(indexes[name])
        if (emptyMetadata && execution === 'trade') {
          changeExecution('trade')
        }
      }
    }
    getMetadata()
  }, [ state.indexes ])

  useEffect(() => {
    setStyles({
      ...clearSelections(), [execution]: selected
    })
  }, [ theme ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let { border, showVolume, maxWidth, width, height, marginTop, chart, paddingTop, marginRight, sideBar } = style.getFormatting()

  if(state.native){
    return(
      <Grid container direction='column' alignItems='center' justify='space-between'>
        <Grid item>
          <div className={classes.nav}>
            <ButtonGroup disableElevation variant='outlined'>
              <ButtonMarket style={styles.trade} onClick={() => changeExecution('trade')}> {t('trade')} </ButtonMarket>
              <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> {t('mint')} </ButtonMarket>
              <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> {t('burn')} </ButtonMarket>
              <ButtonMarket style={styles.swap} onClick={() => changeExecution('swap')}> {t('swap')} </ButtonMarket>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid item>
          { execution === 'mint' && <MintStateProvider><Mint metadata={metadata} market={name}/></MintStateProvider> }
          { execution === 'burn' && <BurnStateProvider><Burn metadata={metadata} market={name} /></BurnStateProvider> }
          { execution === 'trade' && <TradeStateProvider><TradeTab metadata={metadata} market={name} /></TradeStateProvider> }
          { execution === 'swap' && <SwapStateProvider><Swap metadata={metadata} /></SwapStateProvider> }
        </Grid>
      </Grid>
    )
  }

  const usedDelta = metadata && Object.keys(metadata).length ? (
    yAxisKey === 'value' ? (duration === 'day' ? metadata.delta : metadata.weekDelta)
    : (duration === 'day' ? metadata.tvlDayDelta : metadata.tvlWeekDelta)
  ) : 0;

  const usedPriceOrTVL = metadata && Object.keys(metadata).length ?
  (yAxisKey === 'value' ? metadata.price : metadata.marketcap) : 0;
  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  return (
    <div className={classes.root} style={{ maxWidth, ...border }}>
      <div className={classes.header} style={{ width }}>
          {state.request && metadata.category && (
            <ul style={{ padding: 0, listStyle: 'none', display: 'inline-block' }}>
              <li style={{ float: 'left', marginRight: 17.5 }}>
                <img src={categoryMetadata[metadata.category].normal[mode]} style={{ width: 17.5 }} />
              </li>
              <li style={{ float: 'left', marginRight }}>
                <h3 className={classes.title}> {metadata.name}  [{metadata.symbol}]</h3>
              </li>
              <li style={{ float: 'left', marginRight }}>
                <h4 className={classes.price}>
                  ${usedPriceOrTVL.toLocaleString()}<Delta value={usedDelta} />
                </h4>
              </li>
              {showVolume && (
                <li style={{ float: 'right'}}>
                  <span className={classes.alternative}>{t('volume')}: ${metadata.volume}</span>
                </li>
              )}
            </ul>
          )}
          {!state.request && (
              <TitleLoader color={state.background} />
          )}
      </div>
      <div className={classes.sidebar} style={{ height, marginTop, width: sideBar }}>
        <Grid container direction='column' alignItems='center' justify='space-around'>
          <Grid item>
            <header className={classes.selections}>
              <ButtonGroup disableElevation variant='outlined'>
                <ButtonMarket title={t('tradeMsg', {symbol:metadata.symbol})} style={styles.trade} onClick={() => changeExecution('trade')}> {t('buy')} {metadata.symbol} </ButtonMarket>
                <ButtonMarket title={t('mintMsg', {symbol:metadata.symbol})} style={styles.mint} onClick={() => changeExecution('mint')}> {t('mint')} </ButtonMarket>
                <ButtonMarket title={t('burnMsg', {symbol:metadata.symbol})} style={styles.burn} onClick={() => changeExecution('burn')}> {t('burn')} </ButtonMarket>
                <ButtonMarket title={t('swapMsg')} style={styles.swap} onClick={() => changeExecution('swap')}> {t('swap')} </ButtonMarket>
              </ButtonGroup>
            </header>
          </Grid>
          <Grid item style={{ width: '100%'}}>
            <div className={classes.market}>
              { execution === 'mint' && <MintStateProvider><Mint metadata={metadata} market={name}/></MintStateProvider> }
              { execution === 'burn' && <BurnStateProvider><Burn metadata={metadata} market={name} /></BurnStateProvider> }
              { execution === 'trade' && <TradeStateProvider><TradeTab metadata={metadata} market={name} /></TradeStateProvider> }
              { execution === 'swap' && <SwapStateProvider><Swap metadata={metadata} /></SwapStateProvider> }
            </div>
          </Grid>
        </Grid>
      </div>
      <div className={classes.chart} style={{ ...chart }}>
        <ParentSize>
          {({ width, height }) => (
            <Fragment>
              {!state.request && !metadata.history && (<Loader paddingTop={paddingTop} width={width} height={height} color={state.background}/> )}
              {state.request && metadata.active && metadata.history &&
              <IndexChartContainer
                width={width}
                height={height}
                duration={duration}
                setDuration={setDuration}
                snapshots={metadata.poolHelper.pool.snapshots}
                yAxisKey={yAxisKey}
                setYAxisKey={setYAxisKey}
              /> /* (<Area data={metadata.history} width={width} height={height} /> ) */}
            </Fragment>
          )}
        </ParentSize>
      </div>
      <div className={classes.metrics}>
        <Tabs data={metadata}/>
      </div>
    </div>
  )
}

import React, { Fragment, useState, useContext, useEffect, useReducer } from 'react'

import { useTheme } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { useParams, Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'

import ButtonMarket from '../components/buttons/market'
import Area from '../components/charts/area'
import TradeTab from '../components/index/trade-tab'
import Mint from '../components/index/mint-tab'
import Burn from '../components/index/burn-tab'
import Tabs from '../components/index/tabs'

import style from '../assets/css/routes/index'
import getStyles from '../assets/css'
import { getBalances } from '../lib/markets'
import { store } from '../state'
import { MintStateProvider } from '../state/mint'
import { BurnStateProvider } from '../state/burn';
import { TradeStateProvider } from '../state/trade'
import TitleLoader from '../components/loaders/title'
import Loader from '../components/loaders/area'

function uncapitalizeNth(text, n) {
    return (n > 0 ? text.slice(0, n) : '') + text.charAt(n).toLowerCase() + (n < text.length - 1 ? text.slice(n+1) : '')
}

const selected = {
  color: 'white',
  background: '#666666'
}

const useStyles = getStyles(style)

export default function Index(){
  let { state, dispatch } = useContext(store)
  let { name } = useParams()

  name = uncapitalizeNth(name.toUpperCase(), name.length-1)

  const [ styles, setStyles ] = useState({ trade: selected, mint: {}, burn: {}})
  const [ metadata, setMetadata ] = useState({})
  const [ execution, setExecution ] = useState('trade')
  const classes = useStyles()
  const theme = useTheme()

  const changeExecution = (option) => {
    let newStyle = clearSelections()

    if(option == 'burn') {
      newStyle.burn = selected;
    } else if(option == 'mint'){
      newStyle.mint = selected
    } else {
      newStyle.trade = selected
    }

    setStyles(newStyle)
    setExecution(option)
   }

  const clearSelections = () => {
    return {
      trade: {}, mint: {}, burn: {}
    }
  }

  useEffect(() => {
    const retrieveBalances = async() => {
      let { account, indexes, web3 } = state

      if(web3.injected && indexes && indexes[name]){
        let { assets } = indexes[name]
        let balances =  await getBalances(web3[process.env.REACT_APP_ETH_NETWORK], account, assets, {})

        await dispatch({ type: 'BALANCE',
          payload: { balances }
        })
      }
    }
    retrieveBalances()
  }, [ state.web3.injected ])

  useEffect(() => {
    const getMetadata = async() => {
      let { indexes, web3, account } = state
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
      dispatch({ type: 'LOAD', payload: true })
    }
  }, [ ])

  let { border, showVolume, maxWidth, width, height, marginTop, chart, paddingTop, marginRight, sideBar } = style.getFormatting()

  if(state.native){
    return(
      <Grid container direction='column' alignItems='center' justify='space-between'>
        <Grid item>
          <div className={classes.nav}>
            <ButtonGroup disableElevation variant='outlined'>
              <ButtonMarket style={styles.trade} onClick={() => changeExecution('trade')}> Trade </ButtonMarket>
              <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> Mint </ButtonMarket>
              <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> Burn </ButtonMarket>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid item>
          { execution === 'mint' && <MintStateProvider><Mint metadata={metadata} market={name}/></MintStateProvider> }
          { execution === 'burn' && <BurnStateProvider><Burn metadata={metadata} market={name} /></BurnStateProvider> }
          { execution === 'trade' && <TradeStateProvider><TradeTab metadata={metadata} market={name} /></TradeStateProvider> }
        </Grid>
      </Grid>
    )
  }

  return (
    <div className={classes.root} style={{ maxWidth, ...border }}>
      <div className={classes.header} style={{ width }}>
          {state.request && (
            <ul style={{ padding: 0, listStyle: 'none', display: 'inline-block' }}>
              <li style={{ float: 'left', marginRight }}>
                <h3 className={classes.title}> {metadata.name} [{metadata.symbol}]</h3>
              </li>
              <li style={{ float: 'left', marginRight }}>
                <h4 className={classes.price}> ${metadata.price}
                  <span style={{ color: metadata.delta > 0 ? '#00e79a': '#ff005a' }}>
                  &nbsp;({ metadata.delta > 0 ? '+' : ''}{metadata.delta}%)
                  </span>
                </h4>
              </li>
              {showVolume && (
                <li style={{ float: 'right'}}>
                  <span className={classes.alternative}>24H VOLUME: ${metadata.volume}</span>
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
                <ButtonMarket style={styles.trade} onClick={() => changeExecution('trade')}> Trade </ButtonMarket>
                <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> Mint </ButtonMarket>
                <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> Burn </ButtonMarket>
              </ButtonGroup>
            </header>
          </Grid>
          <Grid item style={{ width: '100%'}}>
            <div className={classes.market}>
              { execution === 'mint' && <MintStateProvider><Mint metadata={metadata} market={name}/></MintStateProvider> }
              { execution === 'burn' && <BurnStateProvider><Burn metadata={metadata} market={name} /></BurnStateProvider> }
              { execution === 'trade' && <TradeStateProvider><TradeTab metadata={metadata} market={name} /></TradeStateProvider> }
            </div>
          </Grid>
        </Grid>
      </div>
      <div className={classes.chart} style={{ ...chart }}>
        <ParentSize>
          {({ width, height }) => (
            <Fragment>
              {!state.request && !metadata.history && (<Loader paddingTop={paddingTop} width={width} height={height} color={state.background}/> )}
              {state.request && metadata.active && metadata.history && (<Area data={metadata.history} width={width} height={height} /> )}
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

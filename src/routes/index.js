import React, { Fragment, useState, useContext, useEffect, useReducer } from 'react'

import { makeStyles, useTheme, styled } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { useParams, useLocation } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import ContentLoader from "react-content-loader"

import ButtonMarket from '../components/buttons/market'
import Area from '../components/charts/area'
import Trade from '../components/trade'
import Mint from '../components/mint'
import Burn from '../components/burn'
import Tabs from '../components/tabs'

import style from '../assets/css/routes/index'
import getStyles from '../assets/css'
import { getBalances } from '../lib/markets'
import { store } from '../state'

const WETH = '0x554dfe146305944e3d83ef802270b640a43eed44'

const Loader = ({ color, height, width }) => (
    <div style={{ position: 'absolute', paddingTop: '5.675%' }}>
    <ContentLoader
      speed={1}
      height={height}
      width={width}
      viewBox="0 0 1440 320"
      backgroundColor={color}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
    <path fill="#0099ff" fill-opacity="1" d="M0,64L10.4,80C20.9,96,42,128,63,144C83.5,160,104,160,125,160C146.1,160,167,160,188,186.7C208.7,213,230,267,250,266.7C271.3,267,292,213,313,208C333.9,203,355,245,376,240C396.5,235,417,181,438,170.7C459.1,160,480,192,501,186.7C521.7,181,543,139,563,122.7C584.3,107,605,117,626,117.3C647,117,668,107,689,133.3C709.6,160,730,224,751,245.3C772.2,267,793,245,814,224C834.8,203,856,181,877,165.3C897.4,149,918,139,939,149.3C960,160,981,192,1002,197.3C1022.6,203,1043,181,1064,192C1085.2,203,1106,245,1127,234.7C1147.8,224,1169,160,1190,117.3C1210.4,75,1231,53,1252,48C1273,43,1294,53,1315,69.3C1335.7,85,1357,107,1377,112C1398.3,117,1419,107,1430,101.3L1440,96L1440,320L1429.6,320C1419.1,320,1398,320,1377,320C1356.5,320,1336,320,1315,320C1293.9,320,1273,320,1252,320C1231.3,320,1210,320,1190,320C1168.7,320,1148,320,1127,320C1106.1,320,1085,320,1064,320C1043.5,320,1023,320,1002,320C980.9,320,960,320,939,320C918.3,320,897,320,877,320C855.7,320,835,320,814,320C793,320,772,320,751,320C730.4,320,710,320,689,320C667.8,320,647,320,626,320C605.2,320,584,320,563,320C542.6,320,522,320,501,320C480,320,459,320,438,320C417.4,320,397,320,376,320C354.8,320,334,320,313,320C292.2,320,271,320,250,320C229.6,320,209,320,188,320C167,320,146,320,125,320C104.3,320,83,320,63,320C41.7,320,21,320,10,320L0,320Z"></path>
  </ContentLoader>
  </div>
)

const TitleLoader = ({ color }) => (
  <ContentLoader
    speed={1}
    width='925'
    height={50}
    viewBox="0 0 925 50"
    backgroundColor={color}
    foregroundColor='rgba(153, 153, 153, 0.5)'
  >
    <rect x="240" y="15" rx="3" ry="3" width="75" height="22" />
    <rect x="0" y="15" rx="3" ry="3" width="225" height="22" />
    <rect x="425" y="15" rx="3" ry="3" width="125" height="22" />
    <rect x="725" y="15" rx="3" ry="3" width="150" height="22" />
    <rect x="565" y="15" rx="3" ry="3" width="50" height="22" />
  </ContentLoader>
)

const dummy = {
  symbol: ''
}

const selected = {
  color: 'white',
  background: '#666666'
}

const useStyles = getStyles(style)

export default function Index(){
  let { state, dispatch } = useContext(store)
  let { name } = useParams()
  name = name.toUpperCase()

  const [ styles, setStyles ] = useState({ trade: selected, mint: {}, burn: {}})
  const [ component, setComponent ] = useState(<Trade market={name}/>)
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const [ metadata, setMetadata ] = useState({})
  const [ execution, setExecution ] = useState('trade')
  const [ path, setPath ] = useState(null)
  const location = useLocation()
  const classes = useStyles()
  const theme = useTheme()

  const changeExecution = (option) => {
    let newStyle = clearSelections()

    if(option == 'burn') {
      setComponent(<Burn metadata={metadata} market={name} / >)
      newStyle.burn = selected
    } else if(option == 'mint'){
      setComponent(<Mint metadata={metadata} market={name}/>)
      newStyle.mint = selected
    } else {
      setComponent(<Trade metadata={metadata} market={name} />)
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

        if(web3.injected){
          let { assets } = indexes[name]
          let balances =  await getBalances(web3.rinkeby, account, assets, {})

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

      if(Object.keys(indexes).length > 0){
        setMetadata(indexes[name])
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
      setPath(name)
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  useEffect(() => {
    if(name != path && path != null){
      setMetadata(state.indexes[name])
      forceUpdate()
    }
  }, [ name ])

  useEffect(() => {
    if(path == null){
      setPath(name)
    }
  }, [ location.pathname ])

  if(state.native) return(
      <Grid container direction='column' alignItems='center' justify='space-between'>
        <Grid item>
          <div className={classes.nav}>
            <ButtonGroup disableElevation variant='outlined'>
              <ButtonMarket style={styles.trade} className='trade' onClick={() => changeExecution('trade')}> Trade </ButtonMarket>
              <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> Mint </ButtonMarket>
              <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> Burn </ButtonMarket>
            </ButtonGroup>
          </div>
        </Grid>
        <Grid item>
          {component}
        </Grid>
      </Grid>
  )


  let { border, maxWidth, width, height, marginTop, chart } = style.getFormatting()

  return (
    <div className={classes.root} style={{ maxWidth, border }}>
      <div className={classes.header} style={{ width }}>
          {state.request && (
            <ul style={{ listStyle: 'none', display: 'inline-block', padding: 0 }}>
              <li style={{ float: 'left', marginRight: 50 }}>
                <h3 className={classes.title}> {metadata.name} [{metadata.symbol}]</h3>
              </li>
              <li style={{ float: 'left', marginRight: 50 }}>
                <h4 className={classes.price}> {metadata.price} <span className={classes.delta}>({metadata.delta})</span></h4>
              </li>
              <li style={{ float: 'right'}}>
                <span className={classes.alternative}>VOLUME: {metadata.marketcap}</span>
              </li>
            </ul>
          )}
          {!state.request && (
              <TitleLoader color={state.background} />
          )}
      </div>
      <div className={classes.sidebar} style={{ height, marginTop }}>
        <Grid container direction='column' alignItems='center' justify='space-around'>
          <Grid item>
            <header className={classes.selections}>
              <ButtonGroup disableElevation variant='outlined'>
                <ButtonMarket style={styles.trade} className='trade' onClick={() => changeExecution('trade')}> Trade </ButtonMarket>
                <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> Mint </ButtonMarket>
                <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> Burn </ButtonMarket>
              </ButtonGroup>
            </header>
          </Grid>
          <Grid item>
            <div className={classes.market}>
              {component}
            </div>
          </Grid>
        </Grid>
      </div>
      <div className={classes.chart} style={{ ...chart }}>
        <ParentSize>
          {({ width, height }) => (
            <Fragment>
              {!state.request && !metadata.history && (<Loader width={width} height={height} color={state.background}/> )}
              {state.request && metadata.history && (<Area data={metadata.history} width={width} height={height} /> )}
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

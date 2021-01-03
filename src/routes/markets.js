import React, { Fragment, useState, useEffect, useContext } from "react";

import { useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Link, useHistory } from 'react-router-dom'
import BN from 'bn.js'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Spline from '../components/charts/spline'
import Pie from '../components/charts/pie'
import Canvas from '../components/canvas'
import Banner from '../components/banner'
import Wrapper from '../components/wrapper'
import Table from '../components/table'
import Loader from '../components/loader'
import Copyable from '../components/copyable'

import { initialPoolState, categoryMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/markets'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

export default function Markets(){
  const [ market, setMarket ] = useState(initialPoolState)
  const [ pie, setPie ] = useState(<Fragment />)
  const history = useHistory()
  const classes = useStyles()
  const theme = useTheme()

  let { state, dispatch } = useContext(store)
  let { request, native } = state

  const changeMarket = (m) => {
    let { active, address} = state.indexes[m]

    if(market.symbol == m){
      if(!active){
        history.push(`pool/${address.toLowerCase()}`)
      } else {
        history.push(`index/${m.toLowerCase()}`)
      }
    } else {
      setMarket(state.indexes[m])
    }
  }

  const exploreMarket = () => {
    let { active, address, symbol } = market

    if(!active){
      history.push(`pool/${address.toLowerCase()}`)
    } else {
      history.push(`index/${symbol.toLowerCase()}`)
    }
  }

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0
        && market == initialPoolState
      ){
      let keys = Object.keys(state.indexes)

      setMarket(state.indexes[keys[0]])
    }
  }, [ state.indexes ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let { active } = market
  let {
    resolution, top, margin, height, pre, pre2, paddingLeft, width, marginTop, canvasMargin, canvasWidth
  } = style.getFormatting({ request, native, active })
  let mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  return (
    <Fragment>
      <Banner native={native} />
      <Grid container direction='column' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <div style={{ height: pre2 }}>
          <Canvas native={native} style={{ margin: canvasMargin }}>
            {!native && (
              <Spline absolute={true} ready={request} native={native} height={height} color='#66FFFF' metadata={market} padding={top} />
            )}
            <div className={classes.market} style={{ paddingLeft, width: canvasWidth }}>
              {!native && (
                <Fragment>
                  <div style={{ float: 'left', marginRight: 20, marginTop: 25 }}>
                    <img src={categoryMetadata[market.category][mode]} style={{ width: 50 }} />
                  </div>
                  <div style={{ float: 'right' }}>
                    <h2> {market.name} [{market.symbol}]</h2>
                    {state.request && !active && (
                      <h3 style={{ color: 'orange' }}> UNINITIALISED </h3>
                    )}
                    {active && (
                      <h3 style={{ color: '#999999' }}> ${market.price}
                        <span style={{ color: market.delta > 0 ? '#00e79a': '#ff005a'}}>
                          &nbsp;({market.delta > 0 ? '+' : ''}{market.delta}%)
                        </span>
                      </h3>
                    )}
                  </div>
                </Fragment>
              )}
              {native && (
                <Fragment>
                  <div style={{ float: 'left', marginRight: 10, marginTop: 15 }}>
                    <img src={categoryMetadata[market.category][mode]} style={{ width: 40 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '4.675vw'}}> {market.name.replace(' Top', '')}</h3>
                    {request && !active && (
                      <h3 style={{ color: 'orange' }}> UNINITIALISED </h3>
                    )}
                    {active && (
                      <Fragment>
                        <h4 style={{ marginTop: 7.5, color: '#999999' }}> ${market.price}
                          <span style={{ color: market.delta > 0 ? '#00e79a': '#ff005a'}}>
                            &nbsp;({market.delta > 0 ? '+' : ''}{market.delta}%)
                          </span>
                        </h4>
                      </Fragment>
                    )}
                  </div>
              </Fragment>
            )}
            </div>
            {!native && (
              <Wrapper style={{ background: theme.palette.primary.main }}>
                <ul className={classes.options} style={{ width: pre, paddingRight: 20 }}>
                  <li>ADDRESS:
                    <span>
                      <Copyable text={market.address} float='left'>
                        <label style={{ fontSize: 16 }}>
                          {market.address.substring(0, 6)}...{market.address.substring(38, 64)}
                        </label>
                      </Copyable>
                    </span>
                  </li>
                  <li>SUPPLY: <span>{market.supply.toLocaleString()} {market.symbol}</span> </li>
                  <li>VOLUME: <span>${market.volume.toLocaleString()}</span></li>
                  <li>TVL: <span>${market.marketcap.toLocaleString()}</span></li>
                  <li>&nbsp;<span></span></li>
                  <ButtonPrimary margin={{ marginTop }} onClick={exploreMarket}>
                    EXPAND
                  </ButtonPrimary>
                </ul>
                <div className={classes.pie} style={{ width }}>
                  <Pie ready={request} height={resolution} metadata={market} native={native} />
                </div>
              </Wrapper>
            )}
            {native && (
              <Spline absolute={false} ready={request} native={native} height={150} color='#66FFFF' metadata={market} padding={0} />
            )}
          </Canvas>
         </div>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 0em" title='INDEX POOLS'>
            <Table state={state} market={market.symbol} triggerMarket={changeMarket} />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

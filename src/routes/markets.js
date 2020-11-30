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

import { initialPoolState } from '../assets/constants/parameters'
import style from '../assets/css/routes/markets'
import indexed from '../assets/images/indexed.png'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const native = {
  width: '100%'
}

const desktop = {
   width: '30%'
}

export default function Markets(){
  const [ market, setMarket ] = useState(initialPoolState)
  const [ pie, setPie ] = useState(<Fragment />)
  const classes = useStyles()
  const theme = useTheme()
  const history = useHistory()

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

      console.log('SET MARKET')

      setMarket(state.indexes[keys[0]])
    }
  }, [ state.indexes ])

  useEffect(() => {
    console.log('ROOT: MOUNT')

    if(!state.load){
      console.log('REQUEST: INIT')

      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let { active } = market
  let {
    resolution, top, margin, height, pre, pre2, paddingLeft, width, marginTop, canvasMargin
  } = style.getFormatting({ request, native, active })

  return (
    <Fragment>
      <Banner native={native} />
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <div style={{ height: pre2 }}>
          <Canvas native={native} style={{ margin: canvasMargin }}>
            <Spline absolute={true} ready={request} native={native} height={height} color='#66FFFF' metadata={market} padding={top} />
            <div className={classes.market} style={{ paddingLeft }}>
              {!native && (
                 <Fragment>
                  <h2> {market.name} </h2>
                  {state.request && !market.active && (<h3 style={{ color: 'orange' }}> UNINITIALISED </h3>)}
                  {market.active && (
                    <h3 style={{ color: '#999999' }}> ${market.price}
                      <span style={{ color: market.delta > 0 ? '#00e79a': '#ff005a'}}>
                        &nbsp;({market.delta > 0 ? '+' : '-'}{market.delta}%)
                      </span>
                    </h3>
                  )}
                </Fragment>
              )}
              {native && (
                 <Fragment>
                  <h3> [{market.symbol}] </h3>
                  {request && !market.active && (<h4 style={{ color: 'orange' }}> UNINITIALISED </h4>)}
                  {market.active && (
                    <Fragment>
                      <h4 style={{ color: '#999999' }}> ${market.price} </h4>
                      <span style={{ color: market.delta > 0 ? '#00e79a': '#ff005a'}}>
                      ({market.delta > 0 ? '+' : '-'}{market.delta}%)
                      </span>
                    </Fragment>
                  )}
                </Fragment>
              )}
            </div>
            <Wrapper style={{ background: theme.palette.primary.main }}>
              {!native && (
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
                  <li>SUPPLY: <span>{market.supply} {market.symbol}</span> </li>
                  <li>VOLUME: <span>${market.volume.toLocaleString()}</span></li>
                  <li>TVL: <span>${market.marketcap.toLocaleString()}</span></li>
                  <li>&nbsp;<span></span></li>
                  <ButtonPrimary margin={{ marginTop }} onClick={exploreMarket}>
                    EXPAND
                  </ButtonPrimary>
                </ul>
              )}
              <div className={classes.pie} style={{ width }}>
                <Pie ready={request} height={resolution} metadata={market} native={native} />
              </div>
            </Wrapper>
          </Canvas>
         </div>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 0em" title='INDEXES'>
            <Table state={state} market={market.symbol} triggerMarket={changeMarket} />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

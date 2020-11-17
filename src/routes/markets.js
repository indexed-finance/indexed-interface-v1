import React, { Fragment, useState, useEffect, useContext } from "react";

import { styled, useTheme, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { Link, useHistory } from 'react-router-dom'
import BN from 'bn.js'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Spline from '../components/charts/spline'
import Pie from '../components/charts/pie'
import Canvas from '../components/canvas'
import Table from '../components/table'
import Loader from '../components/loader'
import Copyable from '../components/copyable'

import style from '../assets/css/routes/markets'
import indexed from '../assets/images/indexed.png'
import getStyles from '../assets/css'
import { store } from '../state'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: 0,
    active: null,
    volume: 0,
    history: []
}

const Trigger = styled(ButtonPrimary)({
  marginTop: 25,
  marginLeft: 'auto',
  float: 'right',
})

const useStyles = getStyles(style)

const native = {
  width: '100%'
}

const desktop = {
   width: '30%'
}

export default function Markets(){
  const [ market, setMarket ] = useState(dummy)
  const [ pie, setPie ] = useState(<Fragment />)
  const classes = useStyles()
  const theme = useTheme()
  const history = useHistory()

  let { state, dispatch } = useContext(store)
  let { request, native } = state

  const Wrapper = styled(Paper)({
    background: theme.palette.primary.main,
    borderLeft: '5px solid #666666',
    borderRight: '3px solid #666666',
    borderTop: '3px solid #666666',
    borderBottom: '3px solid #666666',
    borderTopLeftRadius: 200,
    borderBottomLeftRadius: 200,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    width: '45%',
    boxShadow: 'none',
    position: 'relative',
    float: 'right',
  })

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
        && market == dummy
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
    resolution, top, margin, height, pre, pre2
  } = style.getFormatting({ request, native, active })

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <div style={{ height: pre2 }}>
          <Canvas native={native}>
            <Spline absolute ready={request} native={native} height={height} color='#66FFFF' metadata={market} padding={top} />
            <div className={classes.market}>
              {!native && (
                 <Fragment>
                  <h2> {market.name} </h2>
                  {state.request && !market.active && (<h3 style={{ color: 'orange' }}> UNINITIALISED </h3>)}
                  {market.active && (<h3 style={{ color: '#999999' }}> ${market.price} </h3>)}
                </Fragment>
              )}
              {native && (
                 <Fragment>
                  <h3> [{market.symbol}] </h3>
                  {request && !market.active && (<h4 style={{ color: 'orange' }}> UNINITIALISED </h4>)}
                  {market.active && (<h4 style={{ color: '#999999' }}> ${market.price} </h4>)}
                </Fragment>
              )}
            </div>
            <Wrapper>
              {!native && (
                <ul className={classes.options} style={{ width: pre }}>
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
                  <li>VOLUME: <span>$ {market.volume.toLocaleString()}</span></li>
                  <li>TVL: <span>$ {market.marketcap.toLocaleString()}</span></li>
                  <li>&nbsp;<span></span></li>
                  <Trigger onClick={exploreMarket}> EXPAND </Trigger>
                </ul>
              )}
              <div style={{ position: 'relative', float: 'left', width: !native ? '40%' : '100%' }}>
                <Pie ready={request} height={resolution} metadata={market} native={native} />
              </div>
            </Wrapper>
          </Canvas>
         </div>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 2em" title='INDEXES'>
            <Table state={state} market={market.symbol} triggerMarket={changeMarket} />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

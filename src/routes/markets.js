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
    marketcap: '',
    history: []
}

const Trigger = styled(ButtonPrimary)({
  padding: '.1vw .25vw',
  marginTop: 25,
  marginLeft: 'auto',
  fontSize: '.875vw',
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
    width: '40%',
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

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
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

  let {
    resolution, top, margin, height, percent, pre, pre2
  } = style.getFormatting(state)

  if(state.native && window.innerWidth > 400) top = '82.5px'

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <div style={{ height: pre2 }}>
          <Canvas native={state.native}>
            <Spline absolute state={state} height={height} color='#66FFFF' metadata={market} padding={top} />
            <div className={classes.market}>
              {!state.native && (
                 <Fragment>
                  <h2> {market.name} [{market.symbol}] </h2>
                  {state.request && !market.active && (<h3 style={{ color: 'orange' }}> UNINITIALISED </h3>)}
                  {market.active && (<h3> {market.price} </h3>)}
                </Fragment>
              )}
              {state.native && (
                 <Fragment>
                  <h3> [{market.symbol}] </h3>
                  {state.request && !market.active && (<h4 style={{ color: 'orange' }}> UNINITIALISED </h4>)}
                  {market.active && (<h4> {market.price} </h4>)}
                </Fragment>
              )}
            </div>
            <Wrapper>
              {!state.native && (
                <ul className={classes.options} style={{ width: pre }}>
                  <li>ADDRESS:
                    <span>
                      {market.address.substring(0, 6)}...{market.address.substring(38, 64)}
                    </span>
                  </li>
                  <li>SUPPLY: <span>{market.supply} {market.symbol}</span> </li>
                  <li>TVL: <span>{market.marketcap}</span></li>
                  <li>&nbsp;<span></span> </li>
                  <li>&nbsp;<span></span></li>
                  <Link to={`index/${market.symbol.toLowerCase()}`}>
                    <Trigger> EXPAND </Trigger>
                  </Link>
                </ul>
              )}
              <div style={{ position: 'relative', float: 'left', width: !state.native ? '40%' : '100%' }}>
                <Pie ready={state.request} height={resolution} metadata={market} />
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

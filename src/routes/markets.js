import React, { Fragment, useState, useEffect, useContext } from "react";

import { styled, useTheme, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { Link, useHistory } from 'react-router-dom'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Spline from '../components/charts/spline'
import Pie from '../components/charts/pie'
import Canvas from '../components/canvas'
import Table from '../components/table'

import indexed from '../assets/images/indexed.png'
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

const useStyles = makeStyles(({ spacing, palette }) => ({
  market: {
    position: 'absolute',
    paddingLeft: '2.5%',
    paddingTop: 0,
    '& h2': {
      marginBottom: 0,
    },
    '& h3': {
      marginTop: 10,
      marginBottom: 5
    },
    '& h4': {
      marginTop: 5,
      color: '#999999',
    }
  },
  options: {
    listStyle: 'none',
    color: '#999999',
    paddingRight: 15,
    paddingLeft: 0,
    width: '50%',
    paddingTop: 5,
    float: 'right',
    '& li': {
      fontSize: '1vw',
      marginBottom: 7.5,
      '& span': {
        color: palette.secondary.main,
        float: 'right'
      }
    }
  }

}))

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
    if(market.symbol == m){
      history.push(`index/${m.toLowerCase()}`)
    } else {
      setMarket(state.indexes[m])
    }
  }

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      setMarket(state.indexes['DEFII5'])
    }
  }, [ state.indexes ])

  let resolution = !state.native ? 200 : 75

  let top = !state.native ? 'calc(105px - .375vw)' : '75px'
  let margin = !state.native ? '.5em 3em' : '.5em 1.5em'
  let height = !state.native ? '38%' : '77.5%'
  let percent = !state.native ? '11%' : '55%'

  if(state.native && window.innerWidth > 400) top = '82.5px'

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Canvas native={state.native}>
            <div style={{'z-index': 1, float: 'left', width: '65%', paddingTop: top , position: 'absolute'}}>
              <Spline height={height} color='#66FFFF' metadata={market} />
            </div>
            <div className={classes.market}>
              {!state.native && (
                 <Fragment>
                  <h2> {market.name} [{market.symbol}] </h2>
                  <h3 color='#333333'> {market.price} </h3>
                </Fragment>
              )}
              {state.native && (
                 <Fragment>
                  <h3> [{market.symbol}] </h3>
                  <h4> {market.price} </h4>
                </Fragment>
              )}
            </div>
            <Wrapper>
              {!state.native && (
                <ul className={classes.options}>
                  <li>ADDRESS:
                    <span>
                      {market.address.substring(0, 6)}...{market.address.substring(38, 64)}
                    </span>
                  </li>
                  <li>SUPPLY: <span>{market.supply}</span> </li>
                  <li>OUTFLOW: <span></span> </li>
                  <li>INFLOW: <span></span></li>
                  <li>TVL: <span>{market.marketcap}</span></li>
                  <Link to={`index/${market.symbol.toLowerCase()}`}>
                    <Trigger> EXPAND </Trigger>
                  </Link>
                </ul>
              )}
              <div style={{ position: 'relative', float: 'left', width: !state.native ? '40%' : '100%' }}>
                <Pie height={resolution} metadata={market} />
              </div>
            </Wrapper>
          </Canvas>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 2em" percentage={percent} title='INDEXES'>
            <Table native={state.native} indexes={state.indexes} market={market.symbol} triggerMarket={changeMarket} />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

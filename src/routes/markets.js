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
    paddingLeft: '2em',
    paddingTop: '.5em',
    '& h2': {
      marginBottom: 0,
      fontSize: '1.75vw'
    },
    '& h3': {
      marginTop: 10,
      color: '#999999',
      fontSize: '1.5vw'
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
    width: '37.5%',
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

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Canvas>
            <div style={{'z-index': 1, float: 'left', width: '65%', position: 'absolute', paddingTop: 102.5}}>
              <Spline color='#66FFFF' metadata={market} />
            </div>
            <div className={classes.market}>
              <h2> {market.name} [{market.symbol}] </h2>
              <h3> {market.price} </h3>
            </div>
            <Wrapper>
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
              <Pie metadata={market} />
            </Wrapper>
          </Canvas>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin='.5em 3em' padding="1em 2em" percentage='11%' title='INDEXES'>
            <Table indexes={state.indexes} market={market.symbol} triggerMarket={changeMarket} />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

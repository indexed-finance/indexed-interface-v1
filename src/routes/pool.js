import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

import Container from '../components/container'
import Spline from '../components/charts/spline'
import Canvas from '../components/canvas'
import Approvals from '../components/approvals'

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

const Chart = styled(Canvas)({
  marginRight: 0
})

const useStyles = makeStyles((theme) => ({
  chart: {
    width: '45em',
  },
  stats: {
    borderTop: '3px solid #666666',
    paddingRight: 30,
    paddingLeft: 30,
    '& ul': {
      listStyle: 'none',
      listStyleType: 'none',
      alignItems: 'left',
      overflow: 'hidden',
      marginRight: 0,
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      '& li': {
        display: 'inline',
        textAlign: 'left',
        float: 'left',
        paddingRight: 37.5
      },
    },
  },
  assets: {
    marginTop: -305
  },
  container: {
    width: '30em',
    height: '30em',
  },
  events: {
    width: '41.25em',
    height: '10em'
  },
  market: {
    position: 'absolute',
    paddingLeft: '1.75em',
    '& h2': {
      marginBottom: 0
    },
    '& h3': {
      marginTop: 15,
      color: '#999999',
    },
    '& h4': {
      marginTop: 15,
      color: '#999999',
    }
  },
}))

export default function Pools(){
  const [ data, setData ] = useState(dummy)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      setData(state.indexes['USDI3'])
    }
  }, [ state.indexes ])

  return (
    <Fragment>
      <Grid item container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item>
          <Chart>
            <div className={classes.market}>
              <h2> {data.name} [{data.symbol}] </h2>
              <h3> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h3>
            </div>
            <div className={classes.chart}>
              <Spline metadata={data} height={100} />
            </div>
            <div className={classes.stats}>
              <ul>
                <li> LIQUIDITY: {data.marketcap} </li>
                <li> MARKETCAP : {data.marketcap} </li>
              </ul>
            </div>
          </Chart>
        </Grid>
      <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item>
          <Container margin='2em 0em 1.5em 3em' padding="1em 2em" percentage='22.5%' title='EVENTS'>
            <div className={classes.events}>

            </div>
          </Container>
        </Grid>
        <Grid item>
          <div className={classes.assets}>
            <Container margin='0em 3em' padding="1em 0em" percentage='30%' title='ASSETS'>
              <div className={classes.container}>
                <Approvals metadata={data} />
              </div>
            </Container>
          </div>
        </Grid>
      </Grid>
      </Grid>
    </Fragment>
  )
}

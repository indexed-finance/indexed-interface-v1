import React, { Fragment, useState, useContext, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { makeStyles, styled } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import Area from '../components/charts/area'
import Trade from '../components/trade'
import Mint from '../components/mint'
import Burn from '../components/burn'
import Tabs from '../components/tabs'

import { store } from '../state'

const MarketButton = styled(Button)({
  root: {
    background: 'white',
    color: 'white',
    border: 'solid 3px #999999 !important',
    borderWidth: 3,
    '&:hover, &:active': {
      backgroundColor: 'rgba(112, 245, 112, 0.575) !important',
      color: 'white !important',
    },
    '&:first-of-type, &:nth-of-type(2)': {
      borderRight: 'none !important',
    }
  },
});

const useStyles = makeStyles((theme) => ({
  header: {
    width: '65vw',
    minHeight: '10vh',
    borderBottom: 'solid 3px #666666',
    padding: '0vw 2.5vw',
    display: 'flex'
  },
  title: {
    textTransform: 'capitalize',
    margin: 0
  },
  price: {
    margin: 0
  },
  alternative: {
    margin: 0,
    fontSize: 14,
  },
  delta: {
    color: 'red'
  },
  chart: {
    width: '70vw',
    borderBottom: 'solid 3px #666666',
    height: '55vh'
  },
  sidebar: {
    float: 'right',
    height: '87.5vh',
    width: '30vw',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    marginTop: '-10.5vh',
    alignItems: 'center'
  },
  selections: {
    padding: '1em 6.4em'
  },
  market: {
    padding: '.125em 0em',
    width: '100%',
    color: '#666666',
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
      color: '#333333'
    }
  }
}))

export default function Index(){
  const [ component, setComponent ] = useState(<Trade />)
  const [ chart, setChart ] = useState(<Fragment />)
  const [ metadata, setMetadata ] = useState({})
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { name } = useParams()
  name = name.toUpperCase()

  const changeExecution = (option) => {
    var target = document.getElementsByClassName(option)[0]
    clearSelections()

    if(option == 'burn') setComponent(<Burn/ >)
    else if(option == 'mint') setComponent(<Mint />)
    else setComponent(<Trade />)

    target.style.background = '#666666'
    target.firstChild.style.color = 'white'
   }

  const clearSelections = () => {
    var supply = document.getElementsByClassName('trade')[0]
    var borrow = document.getElementsByClassName('mint')[0]
    var swap = document.getElementsByClassName('burn')[0]

    supply.style.background = 'white'
    supply.firstChild.style.color = 'black'
    borrow.style.background = 'white'
    borrow.firstChild.style.color = 'black'
    swap.style.background = 'white'
    swap.firstChild.style.color = 'black'
  }

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      setChart(renderChart(state.indexes[name].history))
      setMetadata(state.indexes[name])
    }
  }, [ state.indexes ])

  const renderChart = (data) => {
    return(
      <ParentSize>
        {({ width, height }) => <Area data={data} width={width} height={height} /> }
      </ParentSize>
    )
  }

  return (
    <Fragment>
      <div className={classes.header}>
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <h3 className={classes.title}> {metadata.name} [{metadata.symbol}]</h3>
          </Grid>
          <Grid item>
            <h4 className={classes.price}> {metadata.price} <span className={classes.delta}>({metadata.delta})</span></h4>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>VOLUME: {metadata.marketcap}</span>
          </Grid>
        </Grid>
      </div>
      <div className={classes.sidebar}>
        <header className={classes.selections}>
          <ButtonGroup disableElevation variant='outlined'>
            <MarketButton style={{ color: 'white', background: '#666666' }} className='trade' onClick={() => changeExecution('trade')}> Trade </MarketButton>
            <MarketButton className='mint' onClick={() => changeExecution('mint')}> Mint </MarketButton>
            <MarketButton className='burn' onClick={() => changeExecution('burn')}> Burn </MarketButton>
          </ButtonGroup>
        </header>
        <div className={classes.market}>
          {component}
        </div>
      </div>
      <div className={classes.chart}>
        {chart}
      </div>
      <div className={classes.metrics}>
        <Tabs data={metadata.assets}/>
      </div>
    </Fragment>
  )
}

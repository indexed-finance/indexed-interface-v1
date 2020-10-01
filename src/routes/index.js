import React, { Fragment, useState, useContext, useEffect } from 'react'

import { makeStyles, useTheme, styled } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { useParams } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import ButtonMarket from '../components/buttons/market'
import Area from '../components/charts/area'
import Trade from '../components/trade'
import Mint from '../components/mint'
import Burn from '../components/burn'
import Tabs from '../components/tabs'

import { getBalances } from '../lib/markets'
import { store } from '../state'

const WETH = '0x554dfe146305944e3d83ef802270b640a43eed44'

const dummy = {
  symbol: ''
}

const selected = {
  color: 'white',
  background: '#666666'
}

const useStyles = makeStyles(({ palette }) => ({
  header: {
    width: '63.5vw',
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
    width: '68.75vw',
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
    color: palette.secondary.main,
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
  let { state, dispatch } = useContext(store)
  let { name } = useParams()
  name = name.toUpperCase()

  const [ styles, setStyles ] = useState({ trade: selected, mint: {}, burn: {}})
  const [ component, setComponent ] = useState(<Trade market={name}/>)
  const [ chart, setChart ] = useState(<Fragment />)
  const [ metadata, setMetadata ] = useState({})
  const [ execution, setExecution ] = useState('trade')
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

  const renderChart = (data) => {
    return(
      <ParentSize>
        {({ width, height }) => <Area data={data} width={width} height={height} /> }
      </ParentSize>
    )
  }
    useEffect(() => {
      const retrieveBalances = async() => {
        let { account, indexes, web3 } = state

        if(web3.injected){
          let balances = await getBalances(
            web3.rinkeby, account, indexes[name].assets, {}
          )

          await dispatch({ type: 'BAL', payload: { balances } })
        }
     }
     retrieveBalances()
  }, [ state.web3.injected ])

  useEffect(() => {
    const getMetadata = async() => {
      let { indexes, web3, account } = state

      if(Object.keys(indexes).length > 0){
        setChart(renderChart(indexes[name].history))
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
            <ButtonMarket style={styles.trade} className='trade' onClick={() => changeExecution('trade')}> Trade </ButtonMarket>
            <ButtonMarket style={styles.mint} onClick={() => changeExecution('mint')}> Mint </ButtonMarket>
            <ButtonMarket style={styles.burn} onClick={() => changeExecution('burn')}> Burn </ButtonMarket>
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
        <Tabs data={metadata}/>
      </div>
    </Fragment>
  )
}

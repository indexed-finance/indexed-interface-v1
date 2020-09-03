import React, { Fragment, useState } from 'react'

import { useParams } from 'react-router-dom'
import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Swap from '@material-ui/icons/SwapCalls'

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Area from '../components/charts/area'
import Tabs from '../components/tabs'
import Input from '../components/input'


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

const Trigger = styled(Button)({
  border: '2px solid #999999',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.25em',
  marginTop: '7.5px',
  float: 'right',
  '&:hover': {
    fontWeight: 'bold',
    color: '#333333'
  }
})

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
    padding: '1em 6.25em'
  },
  market: {
    padding: '.5em 1.75em',
  }
}));

export default function Index(){
  let { name } = useParams()
  const classes = useStyles()

  const [ component, setComponent ] = useState(<span />)

  const changeExecution = (option) => {
    var target = document.getElementsByClassName(option)[0]
    clearSelections()

    if(option == 'burn') {
      setComponent(<p> Burn </p>)
    } else if(option == 'mint') {
      setComponent(<p> Mint </p>)
    } else {
      setComponent(<p> Trade </p>)
    }

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

  return (
    <Fragment>
      <div className={classes.header}>
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <h3 className={classes.title}> {name} [CCI]</h3>
          </Grid>
          <Grid item>
            <h4 className={classes.price}> $5,410.23 <span className={classes.delta}>(%0.42)</span></h4>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>Marketcap: $50,313,217.33</span>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>Volume: $100,101,333.51</span>
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
          <Grid container direction='column' alignItems='center' justify='space-around'>
            <Grid item>
              <Input label="AMOUNT" variant='outlined' />
            </Grid >
            <Grid item>
              <IconButton> <Swap/> </IconButton>
            </Grid>
            <Grid item>
              <Input label="RECIEVE" variant='outlined' />
            </Grid>
            <Grid item>
              <Trigger> EXECUTE </Trigger>
            </Grid>
          </Grid>
        </div>
      </div>
      <div className={classes.chart}>
        <ParentSize>
          {({ width, height }) =>
          <Area width={width} height={height} />
          }
        </ParentSize>
      </div>
      <div className={classes.metrics}>
        <Tabs />
      </div>
    </Fragment>
  )
}

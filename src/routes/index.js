import React, { Fragment, useState } from 'react'

import { useParams } from 'react-router-dom'
import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Swap from '@material-ui/icons/SwapCalls'
import Divider from '@material-ui/core/Divider';

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Area from '../components/charts/area'
import Tabs from '../components/tabs'
import Input from '../components/input'
import Adornment from '../components/adornment'
import NumberFormat from '../utils/format'
import Mint from '../components/mint'
import Burn from '../components/burn'

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
  marginTop: 10,
  marginLeft: 125,
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
    padding: '1em 6.5em'
  },
  market: {
    padding: '.125em 0em',
  },
  inputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    }
  },
  altInputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 32.5
    }
  },
  divider: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  market: {
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
}));

export default function Index(){
  const [ component, setComponent ] = useState(<Trade />)
  const classes = useStyles()
  let { name } = useParams()

  const changeExecution = (option) => {
    var target = document.getElementsByClassName(option)[0]
    clearSelections()

    if(option == 'burn') {
      setComponent(<Burn/ >)
    } else if(option == 'mint') {
      setComponent(<Mint />)
    } else {
      setComponent(<Trade />)
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

  function Trade() {
    return(
      <Grid container direction='column' alignItems='center' justify='space-around'>
        <Grid item>
          <Input className={classes.inputs} label="AMOUNT" variant='outlined'
            InputProps={{
              endAdornment: <Adornment market='ETH'/>,
              inputComponent: NumberFormat
            }}
          />
        </Grid >
        <Grid item>
          <IconButton> <Swap/> </IconButton>
        </Grid>
        <Grid item>
          <Input className={classes.altInputs} label="RECIEVE" variant='outlined'
            InputProps={{
              endAdornment: 'CCI',
              inputComponent: NumberFormat
            }}
          />
        </Grid>
        <Grid item>
            <div className={classes.divider} />
            <div className={classes.market}>
              <p> ROUTE: <span> DAI {'->'} CCI </span> </p>
              <p> PRICE: <span> $5,060.45 </span> </p>
              <p> PRICE EFFECT: <span> %.23 </span> </p>
              <p> SOURCE: <span> UNISWAP </span> </p>
              <p> GAS: <span> $0.21 </span> </p>
            </div>
            <div className={classes.divider} />
        </Grid>
        <Grid item>
          <Trigger> EXECUTE </Trigger>
        </Grid>
      </Grid>
    )
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
            <span className={classes.alternative}>MARKETCAP: $50,313,217.33</span>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>VOLUME: $100,101,333.51</span>
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
        <ParentSize>
          {({ width, height }) => <Area width={width} height={height} /> }
        </ParentSize>
      </div>
      <div className={classes.metrics}>
        <Tabs />
      </div>
    </Fragment>
  )
}

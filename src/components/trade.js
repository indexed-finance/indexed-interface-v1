import React, { useContext, useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Swap from '@material-ui/icons/SwapCalls'
import IconButton from '@material-ui/core/IconButton'

import ButtonPrimary from './buttons/primary'
import NumberFormat from '../utils/format'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

import { getPair } from '../lib/markets'
import { store } from '../state'

const useStyles = makeStyles((theme) => ({
  inputs: {
    marginLeft: -22.5,
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    },
  },
  altInputs: {
    marginLeft: -22.5,
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 32.5
    }
  },
  swap: {
    marginLeft: -22.5
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

export default function Trade({ market }) {
  const [ contract, setContract ] = useState({})
  const [ output, setOutput ] = useState(null)
  const [ input, setInput ] = useState(null)
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  const handleChange = (event) => {
    let { name, value } = event.target

    if(name == 'input'){
      setInput(event.target.value)
      setOutput(event.target.value/2)
    } else {
      setOutput(event.target.value)
      setInput(event.target.value * 2)
    }
  }

  useEffect(() => {
    const getPairMetadata = async() => {
      if(state.indexes[market]) {
        let { web3, indexes } = state

        let contract = await getPair(web3.rinkeby, indexes[market].address)
        // let price = await contract.methods.price0CumulativeLast().call()
         // let reserves = await contract.methods.getReserves().call()
        setContract(contract)
      }
    }
    getPairMetadata()
  }, [ state.indexes ])

  useEffect(() => {

  }, [output, input])

  return(
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <Input className={classes.inputs} label="AMOUNT" variant='outlined'
          helperText="BALANCE: 0"
          onChange={handleChange}
          name="input"
          value={input}
          InputProps={{
            endAdornment: <Adornment market='ETH'/>,
            inputComponent: NumberFormat
          }}
        />
      </Grid >
      <Grid item>
        <div className={classes.swap}>
          <IconButton> <Swap/> </IconButton>
        </div>
      </Grid>
      <Grid item>
        <Input className={classes.altInputs} label="RECIEVE" variant='outlined'
          helperText={`1 ${market} = 0.0005 ETH`}
          onChange={handleChange}
          value={output}
          name="output"
          InputProps={{
            inputComponent: NumberFormat,
            endAdornment: market
          }}
        />
      </Grid>
      <Grid item>
          <div className={classes.divider} />
          <div className={classes.market}>
            <p> ROUTE: <span> </span> </p>
            <p> PRICE: <span> </span> </p>
            <p> PRICE EFFECT: <span>  </span> </p>
            <p> GAS: <span> </span> </p>
          </div>
          <div className={classes.divider} />
      </Grid>
      <Grid item>
        <ButtonPrimary> EXECUTE </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

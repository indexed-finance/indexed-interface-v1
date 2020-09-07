import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Swap from '@material-ui/icons/SwapCalls'
import IconButton from '@material-ui/core/IconButton'

import ButtonPrimary from './buttons/primary'
import NumberFormat from '../utils/format'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

const useStyles = makeStyles((theme) => ({
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

export default function Trade() {
  const classes = useStyles()

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
        <ButtonPrimary> EXECUTE </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

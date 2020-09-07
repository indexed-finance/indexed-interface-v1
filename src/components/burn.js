import React from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Table from '@material-ui/core/Table'
import Grid from '@material-ui/core/Grid'

import { tokenImages } from '../assets/constants/parameters'
import ButtonPrimary from './buttons/primary'
import NumberFormat from '../utils/format'
import Input from './inputs/input'

const AmountInput = styled(Input)({
  width: 75,
  '& label': {
    fontSize: 12
  },
  '& fieldset': {
    borderWidth: 1,
  },
  '& input:valid + fieldset': {
    borderColor: '#999999',
    borderWidth: '1px !important',
  },
  '& input:invalid + fieldset': {
    borderColor: 'red',
    borderWidth: '1px !important',
  },
  '& input:valid:focus + fieldset': {
    borderWidth: '1px !important',
  }
})

const RecieveInput = styled(Input)({
  width: 200,
  marginBottom: 37.5
})

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    width: 350,
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    marginTop: 20,
    marginBottom: 20,
    border: 'solid 2px #666666',
    borderRadius: 10,
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'scroll',
    height: 325
  },
  item: {
    borderBottom: 'solid 2px #666666',
    paddingBottom: 17.5,
    paddingTop: 17.5,
    fontSize: 12
  },
  divider: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  first: {
    borderBottom: 'solid 2px #666666',
    fontSize: 12,
    paddingBottom: 17.5,
    paddingTop: 0
  },
  container: {
    borderBottom: 'solid 2px #666666',
    borderTop: 'solid 2px #666666',
    flex: '1 1 auto',
    width: '25.5em',
    marginLeft: -32.5,
    maxHeight: 250,
    margin: 0,
    padding: 0
  },
  alt: {
    paddingTop: 17.5,
    paddingBottom: 0,
    fontSize: 12
  },
  secondary: {
    root: {
      top: '75%'
    }
  },
  header: {
    borderBottom: 'solid 2px #666666',
  },
  avatar: {
    width: 32.5,
    height: 32.5
  },
  altWrapper: {
    paddingTop: 17.5,
    minWidth: 45,
  },
  wrapper: {
    minWidth: 45,
  },
  text: {
    fontSize: 12,
    marginRight: 7.5
  },
  input: {
    marginTop: 0,
    marginBottom: 12.5,
    marginLeft: 50,
    width: 250
  },
  table: {
  },
  market: {
    paddingTop: '.5em',
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

function createData(asset, recieve) {
  return { asset, recieve }
}

const rows = [
  createData('LINK', '242,123.22'),
  createData('SNX', '1,023,123.76'),
  createData('DAI', '2,500.00'),
  createData('USDC', '1750.04'),
  createData('ETH', '12.52'),
  createData('COMP', '0.19'),
  createData('AMPL', '10,232,510.23'),
  createData('USDT', '3,000.33'),
];


export default function InteractiveList() {
  const classes = useStyles();
  const [dense, setDense] = React.useState(false)
  const [secondary, setSecondary] = React.useState(false)

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <RecieveInput label="DESTROY" variant='outlined'
          InputProps={{
            endAdornment: 'CCI',
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item>
        <TableContainer className={classes.container}>
        <Table stickyHeader className={classes.table} size="small" aria-label="a dense table">
          <TableHead className={classes.header}>
            <TableRow>
              <TableCell>ASSET</TableCell>
              <TableCell align="right">RECIEVE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.asset}
              </TableCell>
              <TableCell align="right">{row.recieve}</TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Grid>
      <Grid item>
        <div className={classes.market}>
          <p> TOTAL VALUE: <span> $45,300.32 </span> </p>
          <p> GAS: <span> $32.01 </span> </p>
        </div>
        <div className={classes.divider}/>
      </Grid>
      <Grid item>
        <ButtonPrimary> EXECUTE </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

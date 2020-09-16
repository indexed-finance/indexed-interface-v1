import React, { useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Table from '@material-ui/core/Table'
import Grid from '@material-ui/core/Grid'
import { toContract } from '../lib/util/contracts'
import { getRate, decToWeiHex, getTokens } from '../lib/markets'
import { store } from '../state'

import { tokenImages } from '../assets/constants/parameters'
import BPool from '../assets/constants/abi/BPool.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import ButtonPrimary from './buttons/primary'
import Adornment from './inputs/adornment'
import NumberFormat from '../utils/format'
import Radio from './inputs/radio'
import Input from './inputs/input'

const Trigger = styled(ButtonPrimary)({
  marginTop: 0
})

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
  width: 250,
  marginBottom: 20,
  marginLeft: -27.5
})

const OutputInput = styled(Input)({
  width: 250,
  marginLeft: 82.5,
  marginTop: 75
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
    height: 175,
    margin: 0,
    padding: 0
  },
  alt: {
    paddingTop: 17.5,
    paddingBottom: 0,
    fontSize: 12
  },
  radio: {
    marginLeft: -32.5,
    marginBottom: 20
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


export default function InteractiveList({ market, metadata }) {
  const [ execution, setExecution ] = useState({ f: () => {}, label: null })
  const [ component, setComponent ] = useState(<Multi />)
  const [ isSelected, setSelection ] = useState(true)
  const [ amount, setAmount ] = useState(null)
  const [ balance, setBalance ] = useState(0)
  const classes = useStyles()

  let { state } = useContext(store)

  const burnTokens = async(input) => {
    let amounts = await getRate(state.web3.injected, input, metadata.address)
    let contract = toContract(state.web3.injected, BPool.abi, metadata.address)
    let output = decToWeiHex(state.web3.injected, input)

    await contract.methods.exitPool(
      output,
      amounts.map(t => t.amount)
    ).send({
      from: state.account
    })
  }

  const approveTokens = async(input) => {
    let contract = toContract(state.web3.injected, IERC20.abi, metadata.address)
    let approval = convertNumber(input)

    await contract.methods
    .approve(metadata.address, approval).send({
      from: state.account
    }).on('confirmation', (conf, receipt) => {
      setExecution({
        f: burnTokens,
        label: 'BURN'
      })
    })
  }

  const getAllowance = async() => {
    let contract = toContract(state.web3.injected, IERC20.abi, metadata.address)

    let allowance = await contract.methods
    .allowance(state.account, metadata.address).call()

    return allowance/Math.pow(10,18)
  }

  const getBalance = async() => {
    let contract = toContract(state.web3.injected, IERC20.abi, metadata.address)

    let balance = await contract.methods
    .balanceOf(state.account).call()

    return parseFloat(balance/Math.pow(10,18)).toFixed(2)
  }

  const handleInput = (event) => {
    setAmount(event.target.value)
  }

  const parseNumber = (amount) => {
    return parseFloat(amount/Math.pow(10, 18)).toFixed(2)
  }

  const convertNumber = (amount) => {
    let { toHex, toBN } = state.web3.rinkeby.utils

    if(parseInt(amount) == amount) {
      return toHex(toBN(amount).mul(toBN(1e18)))
    } else {
      return toHex(toBN(amount * Math.pow(10, 18)))
    }
  }

  const handleChange = (event) => {
    if(event.target.checked) setComponent(<Multi />)
    else setComponent(<Single />)
    setSelection(event.target.checked)
  }

  function Multi({ data }) {
    return(
      <Table stickyHeader className={classes.table} size="small">
        <TableHead className={classes.header}>
          <TableRow>
            <TableCell>ASSET</TableCell>
            <TableCell align="right">RECIEVE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {metadata.assets.map((row) => (
          <TableRow key={row.symbol}>
            <TableCell component="th" scope="row">
              {row.symbol}
            </TableCell>
            <TableCell align="right">
              <span id={row.symbol} />
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    )
  }

  function Single() {
    return(
      <OutputInput label="RECIEVE" variant='outlined'
        InputProps={{
          endAdornment: <Adornment market='ETH'/>,
          inputComponent: NumberFormat
        }}
      />
    )
  }

  useEffect(() => {
    const getOutputs = async() => {
      if(!isNaN(parseFloat(amount))){
        let { web3 } = state
        let { address } = metadata
        let { toBN } = web3.rinkeby.utils

        let rates = await getRate(web3.rinkeby, amount, address)
        let payouts = {}

        for(let token in rates){
          let { symbol, amount } = rates[token]
          let element = document.getElementById(symbol)
          let output = toBN(amount).toString()

          element.innerHTML = parseNumber(output)
        }

        if(web3.injected){
          let allowance = await getAllowance()

          if(allowance < parseFloat(amount)){
            setExecution({
              f: approveTokens,
              label: 'APPROVE'
            })
          }
        }
      }
    }
    getOutputs()
  }, [ amount ])

  useEffect(() => {
    setExecution({
      f: burnTokens,
      label: 'BURN'
    })
  }, [])

  useEffect(() => {
    const pullBalance = async() => {
      let balance = await getBalance()
      setBalance(balance)
    }
    pullBalance()
  }, [ state.web3.injected ])

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <RecieveInput label="DESTROY" variant='outlined'
          onChange={handleInput}
          value={amount}
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
          helperText={`BALANCE: ${balance.toLocaleString()}`}
        />
      </Grid>
      <Grid item>
        <div className={classes.radio}>
          <Radio selected={isSelected} triggerChange={handleChange} />
        </div>
      </Grid>
      <Grid item>
        <TableContainer className={classes.container}>
          {component}
        </TableContainer>
      </Grid>
      <Grid item>
        <div className={classes.market}>
          <p> TOTAL VALUE: <span> </span> </p>
          <p> GAS: <span> </span> </p>
        </div>
        <div className={classes.divider}/>
      </Grid>
      <Grid item>
        <Trigger onClick={() => execution.f(amount)}>
          {execution.label}
        </Trigger>
      </Grid>
    </Grid>
  )
}

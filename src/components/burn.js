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
import { getRateMulti, getRateSingle, getBalances, decToWeiHex } from '../lib/markets'
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
    width: 412.5,
    height: 200,
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
  reciept: {
    paddingTop: 25,
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
  },
  helper: {
    cursor: 'pointer'
  }
}))

const WETH = '0x554Dfe146305944e3D83eF802270b640A43eED44'

export default function InteractiveList({ market, metadata }) {
  const [ output, setOutput ] = useState({ symbol: 'ETH', amount: 0, address: WETH  })
  const [ execution, setExecution ] = useState({ f: () => {}, label: null })
  const [ balances, setBalances ] = useState({ input: 0, output: 0 })
  const [ component, setComponent ] = useState(<Multi />)
  const [ selection, setSelection ] = useState(true)
  const [ amount, setAmount ] = useState(null)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const burnTokens = async(rates) => {
    let { web3, account } = state
    let { address, assets } = metadata
    let { toBN } = web3.rinkeby.utils
    let input = decToWeiHex(web3.rinkeby, toBN(amount))
    let contract = toContract(web3.injected, BPool.abi, address)

    if(selection) await burnToMultiple(contract, input, rates)
    else await burnToSingle(contract)
  }

  const burnToSingle = async(contract) => {

  }

  const burnToMultiple = async(contract, input, outputs) => {
    await contract.methods.exitPool(
      input, outputs.map(t => t.amount))
    .send({
      from: state.account
    }).on('confirmation', async(conf, receipt) => {
      if(conf > 2) {
        let inputBalance = await getBalance(metadata.address)
        let outputBalance = await getBalance(output.address)

        setBalances({
          input: inputBalance,
          output: outputBalance
        })
      }
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

  const getBalance = async(address) => {
    let contract = toContract(state.web3.injected, IERC20.abi, address)

    let balance = await contract.methods
    .balanceOf(state.account).call()

    return parseFloat(balance/Math.pow(10,18)).toFixed(2)
  }

  const handleInput = (event) => {
    setAmount(event.target.value)
  }

  const handleBalance = () => {
    setAmount(balances.input)
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
        value={output.amount}
        helperText={<o className={classes.helper} onClick={handleBalance}>
          BALANCE: {balances.output}
        </o>}
        InputProps={{
          endAdornment: <Adornment market={output.symbol}/>,
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
        let input = parseFloat(amount)
        let rates;

        if(selection){
            rates = await getRateMulti(web3.rinkeby, address, input, false)

            for(let token in rates){
              let { symbol, amount } = rates[token]
              let element = document.getElementById(symbol)
              let o = toBN(amount).toString()

              element.innerHTML = parseNumber(o)
            }
        } else {
            console.log(web3.rinkeby, address, output.address, input)
            
            rates = await getRateSingle(web3.rinkeby, address, output.address, input)
            setOutput({ ...rates[0]  })
        }

        if(web3.injected){
          let allowance = await getAllowance()

          if(allowance < parseFloat(amount)){
            setExecution({
              f: approveTokens,
              label: 'APPROVE'
            })
          } else {
            setExecution({
              f: () => burnTokens(rates),
              label: 'BURN'
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
      if(state.web3.injected) {
        let inputBalance = await getBalance(metadata.address)
        let outputBalance = await getBalance(output.address)

        setBalances({
          input: inputBalance,
          output: outputBalance
        })
      }
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
          helperText={<o className={classes.helper} onClick={handleBalance}>
            BALANCE: {balances.input}
          </o>}
        />
      </Grid>
      <Grid item>
        <div className={classes.radio}>
          <Radio selected={selection} triggerChange={handleChange} />
        </div>
      </Grid>
      <Grid item>
        <TableContainer className={classes.container}>
          {component}
        </TableContainer>
      </Grid>
      <Grid item>
        <div className={classes.reciept}>
          <ButtonPrimary onClick={() => execution.f(amount)}>
            {execution.label}
          </ButtonPrimary>
        </div>
      </Grid>
    </Grid>
  )
}

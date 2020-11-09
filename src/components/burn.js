import React, { useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Table from '@material-ui/core/Table'
import Grid from '@material-ui/core/Grid'
import { toWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import { toContract } from '../lib/util/contracts'
import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import getStyles from '../assets/css'
import { store } from '../state'

import style from '../assets/css/components/burn'
import { tokenImages } from '../assets/constants/parameters'
import BPool from '../assets/constants/abi/BPool.json'
import ButtonPrimary from './buttons/primary'
import Adornment from './inputs/adornment'
import NumberFormat from '../utils/format'
import Toggle from './inputs/toggle'
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
})

const OutputInput = styled(Input)({
  width: 250,
  marginTop: 75
})

const useStyles = getStyles(style)

const WETH = '0x554Dfe146305944e3D83eF802270b640A43eED44'

export default function InteractiveList({ market, metadata }) {
  const [ output, setOutput ] = useState({ symbol: null, amount: 0, address: null  })
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
    let input = toWei(parseFloat(amount))

    try {
      let contract = toContract(web3.injected, BPool.abi, address)

      if(selection) await burnToMultiple(contract, input, rates)
      else await burnToSingle(contract, input, rates.amount)
    } catch (e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
      console.log(e)
    }
  }

  const burnToSingle = async(contract, input, recieve) => {
    await contract.methods.exitswapPoolAmountIn(
      output.address, recieve, input
    ).send({
      from: state.account
    }).on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          let inputBalance = await getBalance(metadata.address)
          let outputBalance = await getBalance(output.address)

          setBalances({ input: inputBalance, output: outputBalance})
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const burnToMultiple = async(contract, input, outputs) => {
    await contract.methods.exitPool(
      input, outputs.map(t => t.amount))
    .send({
      from: state.account
    }).on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          let inputBalance = await getBalance(metadata.address)
          let outputBalance = await getBalance(output.address)

          setBalances({ input: inputBalance, output: outputBalance})
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const approveTokens = async(input) => {
    let approval = toWei(input)

    try {
      let contract = getERC20(state.web3.injected, metadata.address)

      await contract.methods
      .approve(metadata.address, approval).send({
        from: state.account
      }).on('confirmation', (conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            setExecution({ f: burnTokens, label: 'BURN' })
            dispatch({ type: 'FLAG', payload: TX_CONFIRM })
          } else {
            dispatch({ type: 'FLAG', payload: TX_REVERT })
          }
        }
      }).catch((data) => {
        dispatch({ type: 'FLAG', payload: TX_REJECT })
      })
    } catch(e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
  }

  const getAllowance = async() => {
    let { web3, account } = state
    let { address } = metadata

    let budget = await allowance(web3.rinkeby, address, account, address)

    return budget/Math.pow(10,18)
  }

  const getBalance = async(address) => {
    let { web3, account } = state

    let balance = await balanceOf(web3.rinkeby, address, account)

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

  const handleChange = (event) => {
    if(event.target.checked) setComponent(<Multi />)
    else setComponent(<Single data={output} />)
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

  function Single({ data }) {
    return(
      <div className={classes.single}>
        <OutputInput label="RECIEVE" variant='outlined'
          value={data.amount}
          helperText={
            <o className={classes.helper} onClick={handleBalance}>
              BALANCE: {balances.output}
            </o>
          }
          InputProps={{
            endAdornment:
              <Adornment onSelect={() => {}}
                assets={metadata.assets}
                market={data.symbol}
              />,
            inputComponent: NumberFormat
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    const getOutputs = async() => {
      if(!isNaN(parseFloat(amount))){
        let { web3, helper } = state
        let { address } = metadata
        let { toBN } = web3.rinkeby.utils
        let input = toWei(parseFloat(amount))
        let rates;

        let pool = helper.initialized.find(i => i.pool.address == address)

        if(selection){
          rates = await pool.calcAllOutGivenPoolIn(input)

          for(let token in rates){
            let { symbol, displayAmount } = rates[token]
            let element = document.getElementById(symbol)

            element.innerHTML = displayAmount
          }
        } else {
          rates = await pool.calcSingleOutGivenPoolIn(output.address, input)
          let amount = rates.displayAmount

          setComponent(<Single data={{ ...rates, amount }} />)
          setOutput({ ...output, amount })
        } if(web3.injected){
          let allowance = await getAllowance()

          if(allowance < parseFloat(amount)){
            setExecution({ f: approveTokens, label: 'APPROVE' })
          } else {
            setExecution({ f: () => burnTokens(rates), label: 'BURN' })
          }
        }
      }
    }
    getOutputs()
  }, [ amount ])

  useEffect(() => {
    setExecution({ f: burnTokens, label: 'BURN' })
  }, [])

  useEffect(() => {
    const pullBalance = async() => {
      if(state.web3.injected) {
        let { address } = metadata.assets[2]

        let inputBalance = await getBalance(metadata.address)
        let outputBalance = await getBalance(address)

        setBalances({ input: inputBalance, output: outputBalance })
      }
    }
    pullBalance()
  }, [ state.web3.injected ])

  useEffect(() => {
    if(metadata != undefined) {
      let { symbol, address } = metadata.assets[2]

      setOutput({ ...output, symbol, address })
    }
  }, [ metadata ])

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
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
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <div className={classes.radio}>
          <Toggle selected={selection} triggerChange={handleChange} />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <TableContainer className={classes.container} style={{ width: '100%' }}>
          {component}
        </TableContainer>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <div className={classes.reciept}>
          <ButtonPrimary onClick={() => execution.f(amount)}>
            {execution.label}
          </ButtonPrimary>
        </div>
      </Grid>
    </Grid>
  )
}

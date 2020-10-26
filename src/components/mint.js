import React, { useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { getRateMulti, getRateSingle, decToWeiHex } from '../lib/markets'
import { tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/components/mint'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'

import BPool from '../assets/constants/abi/BPool.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import ButtonTransaction from './buttons/transaction'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Approvals from './approvals'

import { store } from '../state'

const OutputInput = styled(Input)({
  width: 250,
  marginTop: 75
})

const RecieveInput = styled(Input)({
  width: 250,
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

const useStyles = getStyles(style)

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  )
}

export default function InteractiveList({ market, metadata }) {
  const [ isSelected, setSelection ] = useState(null)
  const [ focus, setFocus ] = useState(null)
  const [ dense, setDense ] = useState(false)
  const [ amount, setAmount ] = useState(null)
  const [ balance, setBalance ] = useState(0)
  const [ rates, setRates ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleChange = (event) => {
    setSelection(event.target.checked)
  }

  const handleAmount = (event) => {
    setAmount(event.target.value)
  }

  const handleRates = (arr) => {
    setRates(arr)
  }

  const mintTokens = async() => {
    let { web3, account } = state
    let { address, assets } = metadata
    let { toWei, toBN } = web3.rinkeby.utils
    let contract = toContract(web3.injected, BPool.abi, address)
    let input = decToWeiHex(web3.rinkeby, amount)

    if(rates.length == 1) {
      await mintSingle(contract, rates[0].address, rates, input)
    } else {
      await mintMultiple(contract, rates, input)
    }
  }

  const mintMultiple = async(contract, conversions, input) => {
    let { web3, account, balances } = state
    let { assets } = metadata

    await contract.methods.joinPool(input, conversions.map(t => t.amount))
    .send({
      from: account
    }).on('confirmation', async(conf, receipt) => {
      let tokenBalance = await getBalance()

      await dispatch({ type: 'BALANCE', payload: { assets } })
      setBalance(tokenBalance)
    })
  }

  const mintSingle = async(contract, tokenAddress, conversions, input) => {
    let { web3, account, balances } = state
    let { assets } = metadata

    await contract.methods.joinswapPoolAmountOut(tokenAddress, conversions[0].amount, input)
    .send({
      from: account
    }).on('confirmation', async(conf, receipt) => {
      let tokenBalance = await getBalance()

      await dispatch({ type: 'BALANCE', payload: { assets } })
      setBalance(tokenBalance)
    })
  }

  const getBalance = async() => {
    let contract = toContract(state.web3.injected, IERC20.abi, metadata.address)

    let balance = await contract.methods
    .balanceOf(state.account).call()

    return parseFloat(balance/Math.pow(10,18)).toFixed(2)
  }

  const handleBalance = () => {
    setAmount(balance)
  }

  useEffect(() => {
    setSelection(true)
  }, [  ])

  useEffect(() => {
    const pullBalance = async() => {
      if(state.web3.injected) {
        let balance = await getBalance()
        setBalance(balance)
      }
    }
    pullBalance()
  }, [ state.web3.injected ])

  let width = !state.native ? '417.5px' : '100vw'

  return (
    <div className={classes.root}>
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput label="RECIEVE" variant='outlined' type='number'
          helperText={<o className={classes.helper} onClick={handleBalance}>
            BALANCE: {balance}
          </o>}
          onChange={handleAmount}
          name='mint-input'
          value={amount}
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <div className={classes.demo}>
          <Approvals param='REQUIRED'
            width={width}
            height='calc(20em - 87.5px)'
            metadata={metadata}
            set={handleRates}
            input={amount}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Trigger onClick={mintTokens}> MINT </Trigger>
      </Grid>
    </Grid>
    </div>
  );
}

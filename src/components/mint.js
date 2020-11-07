import React, { useState, useEffect, useContext } from 'react'

import { toWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import { tokenMetadata } from '../assets/constants/parameters'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import { toContract } from '../lib/util/contracts'

import style from '../assets/css/components/mint'
import getStyles from '../assets/css'

import BPool from '../assets/constants/abi/BPool.json'
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

    try {
      let input = toWei(amount)
      let contract = toContract(web3.injected, BPool.abi, address)



      console.log(rates, input)

      if(rates.length == 1) {
        await mintSingle(contract, rates[0].address, rates, input)
      } else {
        await mintMultiple(contract, rates, input)
      }
    } catch(e) {
      console.log(e)
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
  }

  const mintMultiple = async(contract, conversions, input) => {
    let { web3, account, balances } = state
    let { assets } = metadata
    

    await contract.methods.joinPool(input, conversions.map(t => t.amount))
    .send({
      from: account
    }).on('confirmation', async(conf, receipt) => {
      if(conf == 0) {
        if(receipt.status == 1) {
          let tokenBalance = await getBalance()

          dispatch({ type: 'BALANCE', payload: { assets } })
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
          setBalance(tokenBalance)
        } else {
          return dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const mintSingle = async(contract, tokenAddress, conversions, input) => {
    let { web3, account, balances } = state
    let { assets } = metadata

    await contract.methods.joinswapPoolAmountOut(tokenAddress, conversions[0].amount, input)
    .send({
      from: account
    }).on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          let tokenBalance = await getBalance()

          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
          dispatch({ type: 'BALANCE', payload: { assets } })
          setBalance(tokenBalance)
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const getBalance = async() => {
    let { web3, account } = state
    let { address } = metadata

    let balance = await balanceOf(web3.rinkeby, address, account)

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
        <RecieveInput label="RECIEVE" variant='outlined'
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
            change={setAmount}
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

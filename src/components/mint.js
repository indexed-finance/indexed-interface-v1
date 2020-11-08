import React, { useState, useEffect, useContext } from 'react'

import { toWei, toHex, fromWei, toTokenAmount, toBN } from '@indexed-finance/indexed.js/dist/utils/bignumber';
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
import { toChecksumAddress } from '../assets/constants/functions'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import { toContract } from '../lib/util/contracts'

import style from '../assets/css/components/mint'
import getStyles from '../assets/css'

import BPool from '../assets/constants/abi/BPool.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Approvals from './approval-form'

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

function toFixed(num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return parseFloat(num.toString().match(re)[0]);
}

export default function Mint({ market, metadata }) {
  const [ amount, setAmount ] = useState(null)
  const [ balance, setBalance ] = useState(0)
  const [ single, setSingle ] = useState(false)
  const [ rates, setRates ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleAmount = (event) => {
    if(event.target){
      let { value } = event.target
      let input = parseFloat(value)

      if(!isNaN(input)) setAmount(value)
    } else {
      setAmount(event)
    }
  }

  const checkInputs = (arr) => {
    if(!arr[0]) return

    for(let x = 0; x < arr.length; x++){
      let { symbol, displayAmount, approvalRemainder } = arr[x]

      if(!isNaN(parseFloat(approvalRemainder))){
        let required = parseFloat(fromWei(approvalRemainder))
        let display = parseFloat(displayAmount).toFixed(5)

        required = toFixed(required, 4)
        display = toFixed(display, 4)

        if(required <= display) setInputState(symbol, 1)
        else if(required > display) setInputState(symbol, 0)
      }
    }
  }

  const handleRates = async(arr) => {
    let { web3, helper } = state
    let { address } = metadata

    if(web3.injected) checkInputs(arr)

    if(arr.length == 1) setSingle(arr[0].address)
    else setSingle(false)
  }

  const setInputState = (name, type) => {
    let element = document.getElementsByName(name)[0]
    let { nextSibling } = element.nextSibling

    if(type == 0) nextSibling.style.borderColor = '#009966'
    else if (type == 1) nextSibling.style.borderColor = 'red'
    else nextSibling.style.borderColor = 'inherit'
  }

  const reorderTokens = async(contract, arr) => {
    let tokens = await contract.methods.getCurrentTokens().call()
    let reorg = []

    for(let x = 0; x < arr.length; x++){
      let { address, amount } = arr[x]
      let checkSum = toChecksumAddress(address)
      let index = tokens.indexOf(checkSum)

      reorg[index] = amount
    }
    return reorg
  }


  const mintTokens = async() => {
    let { web3, account } = state
    let { address, assets } = metadata
    let { toWei, toHex } = web3.rinkeby.utils

    try {
      let input = toHex(toWei(amount))
      let contract = toContract(web3.injected, BPool.abi, address)

      if(single) {
        await mintSingle(contract, single, rates, input)
      } else {
        await mintMultiple(contract, rates, input)
      }
    } catch(e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
  }

  const mintMultiple = async(contract, conversions, input) => {
    let { web3, account, balances } = state
    let { assets } = metadata
    let amounts = await reorderTokens(contract, conversions)

    await contract.methods.joinPool(input, amounts)
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
    let target = conversions.find(i => i.address == tokenAddress)
    let { assets } = metadata
    let { account } = state

    await contract.methods.joinswapPoolAmountOut(tokenAddress, input, target.amount)
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
    const pullBalance = async() => {
      if(state.web3.injected) {
        let balance = await getBalance()
        setBalance(balance)
      }
    }
    pullBalance()
  }, [ state.web3.injected ])

  useEffect(() => {
    const calcOutputs = async() => {
      let { helper } = state
      let { address } = metadata
      let pool = helper.initialized.find(i => i.pool.address == address)
      let input = toTokenAmount(parseFloat(amount), 18)
      let newRates = []

      if(!single) {
        newRates = await pool.calcAllInGivenPoolOut(input)
      } else {
        let rate = await pool.calcSingleInGivenPoolOut(single, input)

        for(let x = 0;  x < rates.length; x++) {
          let { address } = rates[x]

          if(address == single) {
            newRates.push(rate)
          } else {
            newRates.push(rates[x])
            newRates[x].displayAmount = null
            newRates[x].amount = '0x0'
          }
        }
      }
      setRates(newRates)
    }
    calcOutputs()
  }, [ amount, single ])

  useEffect(() => {
    if(metadata.assets.length > 1
      && rates.length > 0){
      setRates(metadata.assets)
    }
  }, [ metadata ])

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
          value={amount}
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <div className={classes.demo}>
          <Approvals
            width={width}
            height='calc(20em - 87.5px)'
            targetAddress={metadata.address}
            assets={rates}
            handleTokenAmountsChanged={handleRates}
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

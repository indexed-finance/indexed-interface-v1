import React, { useState, useEffect, useContext } from 'react'

import { PoolHelper } from '@indexed-finance/indexed.js';
import { toWei, toHex, fromWei, toTokenAmount, BigNumber  } from '@indexed-finance/indexed.js/dist/utils/bignumber';
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
import { useMintState } from '../state/mint';

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

export default function Mint({ market, metadata }) {
  let [pool, setPool] = useState(undefined)

  const [ rates, setRates ] = useState([])
  const classes = useStyles()
  const { useToken, mintState, bindPoolAmountInput, setHelper } = useMintState();

  let { state, dispatch } = useContext(store);

  const findHelper = (i) => {
    return i.initialized.find(i => i.pool.address === metadata.address);
  }

  const mint = async() => {
    try {
      let { web3, account, helper } = state
      let { address, assets } = metadata
      let recentHelper = findHelper(helper)
      let contract = toContract(web3.injected, BPool.abi, address)
      let { poolAmountOut, isSingle, tokens, amounts, allowances } = mintState

      let rates = tokens.map((v,i) => ({
        amount: amounts[i], address: v.address, symbol: v.symbol
      }))

      if(checkInputs(allowances, rates)){
        if(isSingle) {
          await mintSingle()
        } else {
          await mintMultiple(contract, rates, poolAmountOut)
        }
      }
    } catch(e) {
        dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
        console.log(e)
      }
   }

  const checkInputs = (allowances, rates) => {
   let canTransact = true

   for(let x = 0; x < allowances.length; x++){
     let { amount, symbol } = rates[x]
     let allowance = allowances[x]

     if(amount.gt(allowance)) {
       setInputState(symbol, 1)
       canTransact = false
     } else {
       setInputState(symbol, 0)
     }
   }
   return canTransact
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
         dispatch({ type: 'BALANCE', payload: { assets } })
         dispatch({ type: 'FLAG', payload: TX_CONFIRM })
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
         dispatch({ type: 'FLAG', payload: TX_CONFIRM })
       } else {
         dispatch({ type: 'FLAG', payload: TX_REVERT })
       }
     }
   }).catch((data) => {
     dispatch({ type: 'FLAG', payload: TX_REJECT })
   })
 }

  useEffect(() => {
    const updatePool = async() => {
      if (!mintState.pool) {
        let { helper } = state
        let newHelper = findHelper(helper)

        setHelper(newHelper)
        setPool(newHelper)
      }
    }
    updatePool()
  }, [ mintState.pool ])


  let width = !state.native ? '417.5px' : '100vw'

  return (
    <div className={classes.root}>
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <RecieveInput label="RECIEVE" variant='outlined'
          helperText={<o className={classes.helper}>
            BALANCE: {0}
          </o>}
          {
            ...(bindPoolAmountInput)
          }
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12} style={{ width: '100%'}}>
        <div className={classes.demo}>
          <Approvals
            width='100%'
            height='calc(40vh - 75px)'
            // targetAddress={metadata.address}
            useToken={useToken}
            tokens={mintState.tokens}
          />
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Trigger onClick={mint}> MINT </Trigger>
      </Grid>
    </Grid>
    </div>
  );
}

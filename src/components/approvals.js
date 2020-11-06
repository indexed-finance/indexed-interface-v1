import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import { toWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import { getRateSingle, getRateMulti, decToWeiHex } from '../lib/markets'
import { tokenMetadata, initialState } from '../assets/constants/parameters'
import style from '../assets/css/components/approvals'
import getStyles from '../assets/css'
import { store } from '../state'

import BPool from '../assets/constants/abi/BPool.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import ButtonTransaction from './buttons/transaction'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

const ApproveButton = styled(ButtonTransaction)({
  fontSize: 10,
  paddingRight: 5
})

const Tick = styled(ListItemIcon)({
  minWidth: 35,
})

const AmountInput = styled(Input)({
  width: 175,
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
  },
  '& input': {
    padding: '.75em 0 .75em .75em',
  }
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
})

const SecondaryActionAlt = styled(ListItemSecondaryAction)({
  top: '57.5%',
  maringLeft: 25,
  cursor: 'pointer'
})

const SecondaryItemText =  styled(ListItemText)({
  margin: 0,
  marginRight: '27.5%',
  paddingLeft: 0,
  '& span': {
    fontSize: 12
  },
  '& .MuiListItemText-secondary': {
    fontSize: 12
  },
  '& .MuiListItemText-primary': {
    fontSize: 10
  }
})

const useStyles = getStyles(style)

export default function Approvals({ balance, metadata, height, width, input, param, set }){
  const [ component, setComponent ] = useState(<span />)
  const [ isSelected, setSelection ] = useState(true)
  const [ checked, setChecked ] = useState([])
  const [ focus, setFocus ] = useState(null)
  const [ dense, setDense ] = useState(false)
  const [ amount, setAmount ] = useState(null)
  const [ targets, setTargets ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleToggle = (value) => () => {
    let { symbol, address } = value
    const currentIndex = checked.indexOf(symbol)
    let newChecked = []
    let newTargets = []

    clearInputs(symbol)

    if (currentIndex === -1) {
      newTargets.push(address)
      newChecked.push(symbol)
    } else {
      if(checked.length == 1) {
        newTargets = metadata.assets.map(i => i.address)
        newChecked = metadata.assets.map(i => i.symbol)
      } else {
        newTargets.push(address)
        newChecked.push(symbol)
      }
    }

    setTargets(newTargets)
    setChecked(newChecked)
  };

  const approveTokens = async(symbol) => {
    let { web3, account } = state
    let { address } = state.balances[symbol]
    let amount = toWei(getInputValue(symbol))

    try {
      let contract = getERC20(web3.injected, address)

      await contract.methods.approve(metadata.address, amount).send({
        from: account
      }).on('confirmation', (conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            dispatch({ type: 'FLAG', payload: TX_CONFIRM })
            setInputState(symbol, 0)
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

  const getAllowance = async(target) => {
    let { web3, account } = state
    let { address } = metadata

    let budget = await allowance(web3.rinkeby, target, account, address)

    return budget/Math.pow(10,18)
  }

  const handleInput = async(event, helper, web3) => {
    let { name } = event.target
    let index = metadata.assets.find(i => i.symbol == name)

    if(param == 'DESIRED' && index != undefined){
      let checkIndex = checked.indexOf(name)
      let { address } = index

      if(checkIndex !== -1){
        let selections = getTargetsAndInfo(checked, [])
        let tokens = []
        let credit

        if(selections.length <= 1){
          credit = await getCreditQuoteSingle(selections[0], helper)
          tokens.push(credit)
        } else if(targets.length > 1) {
          credit = await getCreditQuoteMultiple(selections, helper)
          tokens = credit[1]
          credit = credit[0]
        }

        for(let token in tokens){
          let { address } = tokens[token]
          let { symbol } = metadata.assets.find(i => i.address == address)

          if(web3.injected){
            let { remainingApprovalDisplayAmount } = tokens[token]
            let { amount } = selections[token]

            if(remainingApprovalDisplayAmount != amount){
              let approval = parseFloat(remainingApprovalDisplayAmount)
              let required = parseFloat(amount)

              if(approval < required){
                setInputState(symbol, 1)
              } else {
                setInputState(symbol, 0)
              }
            } else {
              setInputState(symbol, 1)
            }
          }
        }
        await set(credit)
      }
    }
    setFocus(name)
  }

  const getCreditQuoteSingle = async(asset, helper) => {
    let { address, amount } = asset
    let value = toWei(parseFloat(amount))
    let pool = helper.uninitialized.find(i => i.pool.address == metadata.address)

    let credit = await pool.getExpectedCredit(address, value)

    return credit
  }

  const getCreditQuoteMultiple = async(assets, helper) => {
    let values = assets.map(i => toWei(parseFloat(i.amount)))
    let addresses = assets.map(i => i.address)
    let pool = helper.uninitialized.find(i => i.pool.address == metadata.address)

    let credit = await pool.getExpectedCredits(addresses, values)

    return credit
  }

  const getTargetsAndInfo = (selections, arr) => {
    for(let x in selections){
      let symbol = selections[x]

      let index = metadata.assets
      .find(i => i.symbol == symbol)
      let amount = getInputValue(symbol)

      let { address } = index

      if(!isNaN(amount)){
        arr.push({
          symbol, amount, address
        })
      }
    }
    return arr
  }

  const getInputValue = (symbol) => {
    let element = document.getElementsByName(symbol)[0]
    return parseFloat(element.value)
  }

  const handleBalance  = (symbol) => {
    let { amount } = state.balances[symbol]
    let element = document.getElementsByName(symbol)[0]

    element.value = amount

    setFocus(symbol)
  }

  const setInputState = (name, type) => {
    let element = document.getElementsByName(name)[0]
    let { nextSibling } = element.nextSibling

    if(type == 0) nextSibling.style.borderColor = '#009966'
    else if (type == 1) nextSibling.style.borderColor = 'red'
    else nextSibling.style.borderColor = 'inherit'
  }


  const clearInputs = (ignore) => {
    let symbols = metadata.assets.map(i => i.symbol)

    for(let asset in symbols){
      let target = document.getElementsByName(symbols[asset])[0]

      if(symbols[asset] != ignore){
        setInputState(symbols[asset], null)
        target.value = null
      }
    }
  }

  useEffect(() => {
    const getInputs = async() => {
      if(!isNaN(input)){
        let { web3, helper } = state
        let { address } = metadata
        let { toBN, toHex } = web3.rinkeby.utils
        let amount = toWei(parseFloat(`${input}`))
        let rates = []
        let arr;

        let pool = helper.initialized.find(i => i.pool.address == address)

        if(targets.length == 1){
          let rate  = await pool.getJoinRateSingle(targets[0], amount)
          rates.push(rate)
          clearInputs()
        } else {
          rates = await pool.getJoinRateMulti(amount)
        }

        for(let token in rates){
          let { symbol, displayAmount } = rates[token]
          let element = document.getElementsByName(symbol)[0]

          if(web3.injected){
            let { remainingApprovalDisplayAmount } = rates[token]

            if(remainingApprovalDisplayAmount != displayAmount){
              let approval = parseFloat(remainingApprovalDisplayAmount)
              let required = parseFloat(displayAmount)

              if(approval < required){
                setInputState(symbol, 1)
              } else {
                setInputState(symbol, 0)
              }
            } else {
              setInputState(symbol, 1)
            }
          }
          element.value = displayAmount
        }
        set(rates)
      }
    }
    const setInputs = async(arr) => {
      for(let token in metadata.assets){
        let { symbol, desired, address } = metadata.assets[token]
        let element = document.getElementsByName(symbol)[0]

        if(checked.indexOf(symbol) !== -1){
          if(state.web3.injected){
            let allowance = await getAllowance(address)

            if(allowance < parseFloat(desired)){
              setInputState(symbol, 1)
            } else {
              setInputState(symbol, 0)
            }
          }
          element.value = parseFloat(desired).toFixed(3)
        }
      }
    }
    if(input){
      if(param == 'REQUIRED') getInputs()
      else setInputs(checked)
    }
  }, [ input, checked, state.web3.injected ])

  useEffect(() => {
    if(metadata.assets){
      setChecked(metadata.assets.map(i => i.symbol))
      setTargets(metadata.assets.map(i => i.address))
    }
  }, [ metadata ])

  useEffect(() => {
    const verifyAllowance = async() => {
      let { web3, balances, indexes } = state

      if(web3.injected && focus){
        let { address } = metadata.assets.find(i => i.symbol == focus)
        let allowance = await getAllowance(address)
        let amount = getInputValue(focus)

        if(allowance < parseFloat(amount)){
          setInputState(focus, 1)
        } else if(!isNaN(parseFloat(amount))){
          setInputState(focus, 0)
        }
      }
    }
    verifyAllowance()
  }, [ focus ])

  let inputWidth = !state.native ? 200 : 150

  return (
    <List className={classes.list} style={{ height, width }} dense={dense}>
      {metadata.assets.map((token, index) => {
        let selected = checked.indexOf(token.symbol) != -1
        let statement = param == 'DESIRED'
        let f = handleToggle(token)
        let condition = false
        let label
        let secondary =  state.native ? <span id={token.symbol} /> : null

        if(index == metadata.assets.length-1) label = 'last'
        else label = 'item'

        if(param == 'DESIRED') {
          statement = token.desired == 0

          if(statement) f = () => {}

          condition = !selected
        } else {
          condition = !selected
        }

       return(
        <ListItem className={classes[label]} button onClick={f}>
          <Tick>
            <Checkbox
              edge="start"
              checked={selected}
              disabled={statement}
              tabIndex={-1}
              disableRipple
            />
          </Tick>
          <ListItemAvatar className={classes.wrapper}>
            <Avatar className={classes.avatar}
              src={tokenMetadata[token.symbol].image}
             />
          </ListItemAvatar>
          <ListItemText primary={token.symbol}
            secondary={secondary}
           />
          <SecondaryActionAlt>
            <AmountInput variant='outlined' label='AMOUNT' type='number'
              helperText={
                <o className={classes.helper} onClick={() => handleBalance(token.symbol)}>
                  BALANCE: {state.balances[token.symbol].amount}
               </o>}
              style={{ width: inputWidth }}
              InputLabelProps={{ shrink: true }}
              disabled={condition}
              onChange={(e) => handleInput(e, state.helper, state.web3)}
              name={token.symbol}
              InputProps={{
                endAdornment:
                <ApproveButton onClick={() => approveTokens(token.symbol)}>
                  APPROVE
               </ApproveButton>
             }}
            />
          </SecondaryActionAlt>
        </ListItem>
        )
       }
      )}
    </List>
  )
}

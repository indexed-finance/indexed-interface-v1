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

import { getRateSingle, getRateMulti, decToWeiHex } from '../lib/markets'
import { tokenMetadata, initialState } from '../assets/constants/parameters'
import style from '../assets/css/components/approvals'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'

import BPool from '../assets/constants/abi/BPool.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
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
  width: 150,
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

const RecieveInput = styled(Input)({
  width: 250,
  marginLeft: -22.5
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
  const [ checked, setChecked ] = useState([0])
  const [ focus, setFocus ] = useState(null)
  const [ dense, setDense ] = useState(false)
  const [ amount, setAmount ] = useState(null)
  const [ targets, setTargets ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleToggle = (value) => () => {
    let { symbol, address } = value
    const currentIndex = checked.indexOf(symbol)
    const newChecked = [...checked]
    const newTargets = targets

    if (currentIndex === -1) {
      newTargets.push(address)
      newChecked.push(symbol)
    } else {
      newChecked.splice(currentIndex, 1)
      newTargets.splice(currentIndex, 1)
    }

    setTargets(newTargets)
    setChecked(newChecked)
  };

  const approveTokens = async(symbol) => {
    let { address } = state.balances[symbol]
    let contract = toContract(state.web3.injected, IERC20.abi, address)
    let amount = convertNumber(getInputValue(symbol))

    await contract.methods
    .approve(metadata.address, amount).send({
      from: state.account
    }).on('confirmation', (conf, receipt) => {
      setInputState(symbol, 1)
    })
  }

  const getAllowance = async(address) => {
    let contract = toContract(state.web3.rinkeby, IERC20.abi, address)

    let allowance = await contract.methods
    .allowance(state.account, metadata.address).call()

    return allowance/Math.pow(10,18)
  }

  const handleInput = (event) => {
    setFocus(event.target.name)
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

  const handleRequired = (symbol) => {
    let target = document.getElementById(symbol)
    let element = document.getElementsByName(symbol)[0]

    element.value = target.innerHTML
  }

  const convertNumber = (amount) => {
    let { toHex, toBN } = state.web3.rinkeby.utils

    if(parseInt(amount) == amount) {
      return toHex(toBN(amount).mul(toBN(1e18)))
    } else {
      return toHex(toBN(amount * Math.pow(10, 18)))
    }
  }

  const parseNumber = (amount) => {
    return parseFloat(amount/Math.pow(10, 18)).toFixed(2)
  }

  const setInputState = (name, type) => {
    let element = document.getElementsByName(name)[0]
    let { nextSibling } = element.nextSibling

    if(type == 0) nextSibling.style.borderColor = '#009966'
    else if (type == 1) nextSibling.style.borderColor = 'red'
    else nextSibling.style.borderColor = 'orange'
  }

  useEffect(() => {
    const getInputs = async() => {
      if(input != null){
        let { web3 } = state
        let { address } = metadata
        let { toBN, toHex } = web3.rinkeby.utils
        let amount = parseFloat(input)
        let rates;

        if(targets.length == 1){
          rates = await getRateSingle(web3.rinkeby, address, targets[0], amount)
        } else {
          rates = await getRateMulti(web3.rinkeby, address, amount, true)
        }

        for(let token in rates){
          let { symbol, amount } = rates[token]
          let element = document.getElementById(symbol)
          let output = toBN(amount).toString()

          element.innerHTML = parseNumber(output)
        }
        set(rates)
      }
    }
    const setInputs = () => {
      if(metadata.assets.length > 0){
        for(let token in metadata.assets){
          let { symbol, desired } = metadata.assets[token]
          let element = document.getElementById(symbol)

          if(desired == 0) {
            element.innerHTML = desired
          }
        }
      }
    }
    if(param == 'REQUIRED') getInputs()
    else if(param == 'DESIRED') setInputs()
  }, [ input ])

  useEffect(() => {
    const verifyAllowance = async() => {
      if(focus != null){
        let { address } = state.balances[focus]
        let allowance = await getAllowance(address)
        let amount = getInputValue(focus)

        if(allowance < parseFloat(amount)){
          setInputState(focus, 1)
        } else {
          setInputState(focus, 0)
        }
      }
    }
    verifyAllowance()
  }, [ focus ])

  return (
    <List className={classes.list} style={{ height, width }} dense={dense}>
      {metadata.assets.map((token, index) => {
        let selected = checked.indexOf(token.symbol) !== -1
        let statement = param == 'DESIRED'
        let f = handleToggle(token)
        let condition = false
        let label

        if(index == metadata.assets.length-1) label = 'last'
        else label = 'item'

        if(param == 'DESIRED') {
          statement = token.desired != 0
          if(statement) f = () => {}
          else selected = true
          condition = statement
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
          <ListItemText primary={token.symbol} />
          <SecondaryItemText primary={param}
            secondary={<span onClick={() => handleRequired(token.symbol)}
                id={token.symbol}
              />
            }
          />
          <SecondaryActionAlt>
            <AmountInput variant='outlined' label='AMOUNT' type='number'
              helperText={
                <o className={classes.helper} onClick={() => handleBalance(token.symbol)}>
                  BALANCE: {state.balances[token.symbol].amount}
               </o>}
              InputLabelProps={{ shrink: true }}
              disabled={condition}
              onChange={handleInput}
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
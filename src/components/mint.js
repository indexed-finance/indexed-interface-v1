import React, { useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { tokenMetadata } from '../assets/constants/parameters'
import { toContract } from '../lib/util/contracts'
import { getTokenWeights } from '../lib/markets'

import BPool from '../assets/constants/abi/BPool.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import ButtonTransaction from './buttons/transaction'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Radio from './inputs/radio'

import { store } from '../state'

const OutputInput = styled(Input)({
  width: 250,
  marginLeft: 85,
  marginTop: 75
})

const ApproveButton = styled(ButtonTransaction)({
  fontSize: 10
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
  top: '50%',
  maringLeft: 25,
  cursor: 'pointer'
})

const SecondaryItemText =  styled(ListItemText)({
  margin: 0,
  marginRight: '35%',
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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    paddingBottom: 0,
    marginBottom: 0
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    padding: 0,
    overflowY: 'scroll',
    height: 205,
    width: 410
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
  altDivider1: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 0em 0em',
    width: '27.5em',
  },
  altDivider2: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '0em 0em 1.5em 0em',
    width: '27.5em',
  },
  first: {
    borderBottom: 'solid 2px #666666',
    fontSize: 12,
    paddingBottom: 17.5,
    paddingTop: 0
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
  market: {
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
  single: {
    height: 205
  }
}));

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  )
}

export default function InteractiveList({ market, metadata }) {
  const [ component, setComponent ] = useState(<span />)
  const [ isSelected, setSelection ] = useState(true)
  const [ focus, setFocus ] = useState(null)
  const [ dense, setDense ] = useState(false)
  const [ inputs, setInputs ] = useState({})
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const approveTokens = async() => {
    let { address } = state.balances[focus]

    let contract = toContract(state.web3.injected, IERC20.abi, address)
    let amount = convertNumber(parseFloat(inputs[focus]))

    await contract.methods
    .approve(metadata.address, amount).send({
      from: state.account
    }).on('confirmation', (conf, receipt) => {
      setInputState(focus, true)
    })
  }

  const getAllowance = async(address) => {
    let contract = toContract(state.web3.injected, IERC20.abi, address)

    let allowance = await contract.methods
    .allowance(state.account, metadata.address).call()

    return allowance/Math.pow(10,18)
  }

  const handleChange = (event) => {
    if(event.target.checked) setComponent(<Multi />)
    else setComponent(<Single />)
    setSelection(event.target.checked)
  }

  const handleInput = (event) => {
    let { value, name } = event.target

    setInputs({ ...inputs, [name]: value })
    setFocus(name)
  }

  const handleBalance  = (symbol) => {
    let { amount } = state.balances[symbol]
    let element = document.getElementsByName(symbol)[0]

    element.value = amount

    setInputs({ ...inputs, [symbol]: amount })
    setFocus(symbol)
  }

  const convertNumber = (amount) => {
    let { toHex, toBN } = state.web3.rinkeby.utils

    if(parseInt(amount) == amount) {
      return toHex(toBN(amount).mul(toBN(1e18)))
    } else {
      return toHex(toBN(amount * Math.pow(10, 18)))
    }
  }

  function Multi() {
    const classes = useStyles()
    let { balances } = state

    return(
      <List className={classes.list} dense={dense}>
        {metadata.assets.map(token => (
          <ListItem className={classes.item}>
            <ListItemAvatar className={classes.wrapper}>
              <Avatar className={classes.avatar}
                src={tokenMetadata[token.symbol].image}
               />
            </ListItemAvatar>
            <ListItemText primary={token.symbol} />
            <SecondaryItemText primary="BALANCE"
              secondary={balances[token.symbol].amount}
              onClick={() => handleBalance(token.symbol)}
            />
            <SecondaryActionAlt>
              <AmountInput variant='outlined' label='AMOUNT'
                InputLabelProps={{ shrink: true }}
                value={inputs[token.symbol]}
                onChange={handleInput}
                name={token.symbol}
                InputProps={{
                  endAdornment:
                   <ApproveButton onClick={approveTokens}>
                      APPROVE
                   </ApproveButton>
                }}
               />
            </SecondaryActionAlt>
          </ListItem>
        ))}
      </List>
    )
  }

  function Single() {
    const classes = useStyles()

    return(
      <div className={classes.single}>
        <OutputInput label="INPUT" variant='outlined'
          InputProps={{
            endAdornment: <Adornment market={market}/>,
            inputComponent: NumberFormat
          }}
        />
      </div>
    )
  }

  const setInputState = (name, bool) => {
    let element = document.getElementsByName(name)[0]
    let { nextSibling } = element.nextSibling

    if(bool) nextSibling.style.borderColor = '#009966'
    else nextSibling.style.borderColor = 'red'
  }

  useEffect(() => {
    const verifyAllowance = async() => {
      if(state.web3.injected){
        let { address } = state.balances[focus]
        let allowance = await getAllowance(address)
        let amount = inputs[focus]

        console.log(inputs)

        if(allowance < parseInt(amount)){
          setInputState(focus, false)
        } else {
          setInputState(focus, true)
        }
      }
    }
    verifyAllowance()
  }, [ inputs ])

  useEffect(() => {
    setComponent(<Multi />)
  }, [ state.balances ])

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <RecieveInput label="RECIEVE" variant='outlined'
          InputProps={{
            endAdornment: market,
            inputComponent: NumberFormat
          }}
        />
      </Grid>
      <Grid item>
        <Radio selected={isSelected} triggerChange={handleChange} />
      </Grid>
      <Grid item>
        <div className={classes.altDivider1} />
        <div className={classes.demo}>
          {component}
        </div>
      </Grid>
      <Grid item>
        <div className={classes.altDivider2} />
        <div className={classes.market}>
          <p> GAS: <span> </span> </p>
        </div>
        <div className={classes.divider} />
      </Grid>
      <Grid item>
        <Trigger> APPROVE </Trigger>
      </Grid>
    </Grid>
  );
}

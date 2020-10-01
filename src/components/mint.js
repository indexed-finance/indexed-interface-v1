import React, { useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'

import { getRateMulti, getRateSingle, getBalances, decToWeiHex } from '../lib/markets'
import { tokenMetadata } from '../assets/constants/parameters'
import { toContract } from '../lib/util/contracts'

import BPool from '../assets/constants/abi/BPool.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import ButtonTransaction from './buttons/transaction'
import Adornment from './inputs/adornment'
import Input from './inputs/input'
import Radio from './inputs/radio'
import Approvals from './approvals'

import { store } from '../state'

const OutputInput = styled(Input)({
  width: 250,
  marginLeft: 85,
  marginTop: 75
})

const RecieveInput = styled(Input)({
  width: 250,
  marginLeft: -22.5
})

const Trigger = styled(ButtonPrimary)({
  marginTop: -7.5
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
    height: 235,
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
    margin: '.5em 0em 0em 0em',
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
  },
  helper: {
    cursor: 'pointer'
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
      let newBalances = await getBalances(web3.injected, account, assets, balances)
      let tokenBalance = await getBalance()

      await dispatch({ type: 'BAL', payload: { balances: newBalances } })
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
      let newBalances = await getBalances(web3.injected, account, assets, balances)
      let tokenBalance = await getBalance()

      await dispatch({ type: 'BAL', payload: { balances: newBalances } })
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

  return (
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
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
      <Grid item>
        <div className={classes.altDivider1} />
        <div className={classes.demo}>
          <Approvals param='REQUIRED' width='417.5px' height='235px'
            metadata={metadata}
            set={handleRates}
            input={amount}
          />
        </div>
      </Grid>
      <Grid item>
        <div className={classes.altDivider2} />
      </Grid>
      <Grid item>
        <Trigger onClick={mintTokens}> MINT </Trigger>
      </Grid>
    </Grid>
  );
}

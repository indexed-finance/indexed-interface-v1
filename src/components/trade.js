import React, { useContext, useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Swap from '@material-ui/icons/SwapCalls'
import IconButton from '@material-ui/core/IconButton'

import ButtonPrimary from './buttons/primary'
import NumberFormat from '../utils/format'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

import IERC20 from '../assets/constants/abi/IERC20.json'
import { toContract } from '../lib/util/contracts'
import { getMarketMetadata } from '../api/gql'
import { getPair, getRouter } from '../lib/markets'
import { store } from '../state'

const WETH = '0x554dfe146305944e3d83ef802270b640a43eed44'

const useStyles = makeStyles((theme) => ({
  inputs: {
    marginLeft: -22.5,
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    },
  },
  altInputs: {
    marginLeft: -22.5,
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 32.5
    }
  },
  swap: {
    marginLeft: -22.5
  },
  divider: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
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
  }
}));

export default function Trade({ market, metadata }) {
  const [ contracts, setContracts ] = useState({ router: '', pair: '', token: ''})
  const [ execution, setExecution ] = useState({ f: () => {}, label: 'SWAP' })
  const [ output, setOutput ] = useState({ amount: null, market: market })
  const [ input, setInput ] = useState({ amount: null, market: 'ETH' })
  const [ prices, setPrices ] = useState({ input: 0, output: 0})
  const [ balance, setBalance ] = useState(0)
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  const handleChange = (event) => {
    let { amount } = event.target.value

    if(event.target.name == 'input'){
      setInput({ ...input, amount })
      amount = amount * prices.input
      setOutput({ ...output, amount })
    }
  }

  const swapTokens = async() => {
    let { address } = contracts.token.options
    let { eth } = state.web3.injected

    let recentBlock = await eth.getBlock('latest')
    let amount0 = convertNumber(input)
    let amount1 = convertNumber(output)

    await contracts.router.methods.swapTokensForExactTokens(
      amount1,
      amount0,
      [ address, WETH ],
      state.account,
      recentBlock.timestamp + 3600
    ).send({
      from: state.account
    })
  }

  const approveTokens = async() => {
    let amount0 = convertNumber(input)
    let { address } = contracts.router.options

    await contracts.token.methods
    .approve(address, amount0).send({
      from: state.account
    }).on('confirmation', async(conf, receipt) => {
      setExecution({
        f: swapTokens,
        label: 'SWAP'
      })
    })
  }

  const getAllowance = async() => {
    let { address } = contracts.router.options

    let allowance = await contracts.token.methods
    .allowance(state.account, address).call()

    return allowance/Math.pow(10,18)
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

  useEffect(() => {
    const getPairMetadata = async() => {
      if(state.indexes[market]) {
        let { web3, indexes } = state
        let { address } = indexes[market].assets[0]

        let router = await getRouter(web3.rinkeby)
        let pair = await getPair(web3.rinkeby, address)
        let token = toContract(web3.rinkeby, IERC20.abi, address)
        let pricing = await getMarketMetadata(pair.options.address)

        setPrices({
          input: parseFloat(pricing.token0Price),
          output: parseFloat(pricing.token1Price)
        })
        setContracts({ pair, token, router })
      }
    }
    getPairMetadata()
  }, [ state.indexes ])

  useEffect(() => {
    const changeProvider = async() => {
      if(contracts.pair.options != undefined){
        let pairAddress = contracts.pair.options.address
        let tokenAddress = contracts.token.options.address
        let routerAddress = contracts.router.options.address

        let token = toContract(state.web3.injected, IERC20.abi, tokenAddress)
        let pair = await getPair(state.web3.injected, tokenAddress)
        let router = await getRouter(state.web3.injected)

        token.options.address = tokenAddress
        router.options.address = routerAddress
        pair.options.address = pairAddress

        setContracts({ token, pair, router })
       }
     }
     changeProvider()
  }, [ state.web3.injected ])

  useEffect(() => {
    const checkAllowance = async() => {
      if(contracts.router.options != undefined){
        let allowance = await getAllowance()

        if(allowance < input){
          setExecution({
            f: approveTokens, label: 'APPROVE'
          })
        } else {
          setExecution({
            f: swapTokens, label: 'SWAP'
          })
        }
      }
    }
    checkAllowance()
  }, [ input ])


  useEffect(() => {
    if(state.web3.injected){
      setBalance(state.balances[input.market].amount)
    }
  }, [ state.balances, input.market ])

  useEffect(() => {
    setExecution({
      f: swapTokens, label: 'SWAP'
    })
  }, [])

  return(
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item>
        <Input className={classes.inputs} label="AMOUNT" variant='outlined'
          helperText={`BALANCE: ${balance}`}
          onChange={handleChange}
          name="input"
          value={input.amount}
          InputProps={{
            endAdornment: <Adornment market={input.market}/>,
            inputComponent: NumberFormat
          }}
        />
      </Grid >
      <Grid item>
        <div className={classes.swap}>
          <IconButton> <Swap/> </IconButton>
        </div>
      </Grid>
      <Grid item>
        <Input className={classes.altInputs} label="RECIEVE" variant='outlined'
          helperText={`1 ${market} = ${prices.input.toFixed(3)} ETH`}
          onChange={handleChange}
          value={output.amount}
          name="output"
          InputProps={{
            inputComponent: NumberFormat,
            endAdornment: output.market
          }}
        />
      </Grid>
      <Grid item>
          <div className={classes.divider} />
          <div className={classes.market}>
            <p> ROUTE: <span> ETH {'->'} {market}</span> </p>
            <p> FEE: <span> </span> </p>
            <p> GAS: <span> </span> </p>
          </div>
          <div className={classes.divider} />
      </Grid>
      <Grid item>
        <ButtonPrimary onClick={execution.f}>
          {execution.label}
        </ButtonPrimary>
      </Grid>
    </Grid>
  )
}

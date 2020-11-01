import React, { useContext, useEffect, useState } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Swap from '@material-ui/icons/SwapCalls'
import IconButton from '@material-ui/core/IconButton'

import ButtonPrimary from './buttons/primary'
import NumberFormat from '../utils/format'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

import { TX_CONFIRM, TX_REJECT, TX_REVERT, MARKET_ORDER } from '../assets/constants/parameters'
import { getPair, getRouter, decToWeiHex } from '../lib/markets'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import style from '../assets/css/components/trade'
import { getMarketMetadata } from '../api/gql'
import getStyles from '../assets/css'
import { store } from '../state'

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'

const Trigger = styled(ButtonPrimary)({
  marginTop: '25px !important'
})

const useStyles = getStyles(style)

export default function Trade({ market, metadata }) {
  const [ output, setOutput ] = useState({ amount: null, market: market, address: null })
  const [ input, setInput ] = useState({ amount: null, market: 'ETH', address: WETH })
  const [ contracts, setContracts ] = useState({ router: '', pair: '', token: ''})
  const [ execution, setExecution ] = useState({ f: () => {}, label: 'SWAP' })
  const [ prices, setPrices ] = useState({ input: 0, output: 0 })
  const [ balances, setBalances ] = useState({ input: 0, output: 0 })
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  const handleChange = (event) => {
    let { name, value } = event.target

    setInput({ ...input, amount: value })
  }

  const setRate = async(entry, inputAddress, outputAddress) => {
    let { injected, rinkeby } = state.web3
    entry = parseFloat(entry)

    if(!isNaN(entry) && entry > 0) {
      let provider = injected != false ? injected : rinkeby
      let i = convertNumber(entry)

      let o = await getAmountOut(i, inputAddress, outputAddress)
      let amount = parseFloat(o[1])/Math.pow(10, 18)

      setOutput({ ...output, amount })

      return amount
      }
    return 0
  }

  const getAmountOut = async(i, inputAddress, outputAddress) => {
    return await contracts.router.methods.getAmountsOut(i, [ inputAddress, outputAddress]).call()
  }

  const getBalance = async(address) => {
    let { injected, rinkeby } = state.web3
    let provider = injected != false ? injected : rinkeby
    let target = injected != false ? state.account : '0x0000000000000000000000000000000000000001'
    let balance = address == WETH ? await provider.eth.getBalance(target): await balanceOf(provider, address, target)

    return parseFloat(balance/Math.pow(10,18)).toFixed(2)
  }

  const changeMarket = async(target) => {
    let { injected, rinkeby, indexes } = state.web3
    let provider = injected != false ? injected : rinkeby
    let { address } = output

    let token = getERC20(provider, target)
    let pair = await getPair(provider, target, address)
    let pricing = await getMarketMetadata(pair.options.address)
    let symbol = await token.methods.symbol().call()
    let rate = await setRate(input.amount, target, address)

    setInput({ ...input, address: target, market: symbol })
    setOutput({ ...output, amount: rate })
    setPrices({
      input: parseFloat(pricing.token1Price),
      output: parseFloat(pricing.token0Price)
    })
    setContracts({ ...contracts, pair, token })
  }

  const changeOrder = () => {
    let { injected, rinkeby } = state.web3
    let provider = injected != false ? injected : rinkeby
    let token = getERC20(provider, output.address)

    setPrices({ input: prices.output, output: prices.input })
    setContracts({ ...contracts, token })
    setInput({ ...output })
    setOutput({ ...input })
  }

  const swapTokens = async(i, o) => {
    let { web3, indexes } = state
    let { eth } = web3.injected

    let block = await eth.getBlock('latest')
    let amount0 = decToWeiHex(web3.injected, i)
    let amount1 = decToWeiHex(web3.injected, o)
    let io = { ...input, amount: i }
    let oi = { ...output, amount: o }
    let f = () => {}

    if(input.address == WETH){
      f = () => swapEthForTokens(amount0, amount1, block)
    } else {
      f = () => swapTokensForEth(amount0, amount1, block)
     }

    dispatch({ type: 'MODAL', payload: MARKET_ORDER(io, oi, f) })
  }

  const swapTokensForEth = async(exactTokens, minETH, recentBlock) => {
    await contracts.router.methods.swapExactTokensForETH(
      exactTokens,
      minETH,
      [ input.address, output.address ],
      state.account,
      recentBlock.timestamp + 3600
    ).send({
      from: state.account
    }, () => dispatch({ type: 'DISMISS'}))
    .on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          let inputBalance = await getBalance(input.address)
          let outputBalance = await getBalance(output.address)

          setBalances({ output: outputBalance, input: inputBalance })
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const swapEthForTokens = async(minETH, exactTokens, recentBlock) => {
    await contracts.router.methods.swapETHForExactTokens(
      exactTokens,
      [ input.address, output.address ],
      state.account,
      recentBlock.timestamp + 3600
    ).send({
      from: state.account,
      value: minETH
    }, () => dispatch({ type: 'DISMISS'}))
    .on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          let inputBalance = await getBalance(input.address)
          let outputBalance = await getBalance(output.address)

          setBalances({ output: outputBalance, input: inputBalance })
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const approveTokens = async(i) => {
    let amount0 = convertNumber(i)
    let { address } = contracts.router.options

    await contracts.token.methods.approve(address, amount0).send({
      from: state.account
     }).on('confirmation', (conf, receipt) => {
       if(conf == 0){
         if(receipt.status == 1){
          setExecution({ f: swapTokens, label: 'SWAP' })
          dispatch({ type: 'FLAG', payload: TX_CONFIRM })
        } else {
          dispatch({ type: 'FLAG', payload: TX_REVERT })
        }
      }
    }).catch((data) => {
      dispatch({ type: 'FLAG', payload: TX_REJECT })
    })
  }

  const getAllowance = async() => {
    let { address } = contracts.router.options
    let { web3, account } = state

    let budget = await allowance(web3.injected, input.address, account, address)

    return parseFloat(budget)/Math.pow(10,18)
  }

  const convertNumber = (amount) => {
    let { toHex, toBN } = state.web3.rinkeby.utils

    if(amount % 1 == 0) {
      return toHex(toBN(amount).mul(toBN(1e18)))
    } else {
      return toHex(toBN(amount * Math.pow(10, 18)))
    }
  }

  const parseNumber = (amount) => {
    return parseFloat(amount/Math.pow(10, 18)).toFixed(2)
  }

  const handleBalance  = async() => {
    let { amount } = state.balances[input.market]
  }

  useEffect(() => {
    const getPairMetadata = async() => {
      if(state.indexes[market]) {
        let { web3, indexes } = state
        let { address, active } = indexes[market]

        if(active) {
          let router = await getRouter(web3.rinkeby)
          let pair = await getPair(web3.rinkeby, WETH, address)
          let token = await getERC20(web3.rinkeby, address)
          let pricing = await getMarketMetadata(pair.options.address)

          setOutput({ ...output, address: indexes[market].address })
          setPrices({
            input: parseFloat(pricing.token0Price),
            output: parseFloat(pricing.token1Price)
          })
          setContracts({ pair, router, token })
        }
      }
    }
    getPairMetadata()
  }, [ state.indexes ])

  useEffect(() => {
    const changeProvider = async() => {
      if(contracts.pair.options != undefined){
        let pairAddress = contracts.pair.options.address
        let routerAddress = contracts.router.options.address
        let tokenAddress = contracts.token.options.address

        let pair = await getPair(state.web3.injected, WETH, tokenAddress)
        let router = await getRouter(state.web3.injected)
        let token = getERC20(state.web3.injected, tokenAddress)

        router.options.address = routerAddress
        token.options.address = tokenAddress
        pair.options.address = pairAddress

        setContracts({ pair, router, token })
       }
     }
     changeProvider()
  }, [ state.web3.injected ])

  useEffect(() => {
    const checkAllowance = async() => {
      let { amount, address } = input
      let rate = await setRate(amount, address, output.address)

      if(contracts.router.options != undefined && state.web3.injected != false){
        let allowance = await getAllowance()

        if(allowance < parseFloat(amount) && address != WETH){
          setExecution({
            f: () => approveTokens(amount), label: 'APPROVE'
          })
        } else  {
          setExecution({
            f: () => swapTokens(amount, rate), label: 'SWAP'
          })
        }
      }
    }
    checkAllowance()
  }, [ input.amount ])

  useEffect(() => {
    const retrieveBalances = async() => {
      if(state.web3.injected != false && output.address != null){
        let inputBalance = await getBalance(input.address)
        let outputBalance = await getBalance(output.address)

        setBalances({
          input: inputBalance,
          output: outputBalance
        })
      }
    }
    retrieveBalances()
  }, [ contracts ])

  let { width } = style.getFormatting(state.native)

  return(
    <Grid container direction='column' alignItems='center' justify='space-around'>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Input className={classes.inputs} label="AMOUNT" variant='outlined'
          helperText={
            <o className={classes.helper} onClick={handleBalance}>
              BALANCE: {balances.input}
            </o>}
          onChange={handleChange}
          name="input"
          value={input.amount}
          InputProps={{
            endAdornment: <Adornment market={input.market} onSelect={changeMarket}/>,
            inputComponent: NumberFormat
          }}
        />
      </Grid >
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <div className={classes.swap}>
          <IconButton onClick={changeOrder}> <Swap/> </IconButton>
          <p>1 {input.market} = {prices.input.toFixed(3)} {output.market}</p>
        </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Input className={classes.altInputs} label="RECIEVE" variant='outlined'
          helperText={
          <o className={classes.helper}>
            BALANCE: {balances.output}
          </o>}
          value={output.amount}
          name="output"
          InputProps={{
            inputComponent: NumberFormat,
            endAdornment: output.market
          }}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
          <div className={classes.market} >
            <p> ROUTE: <span> ETH {'->'} {market}</span> </p>
            <p> FEE: <span> </span> </p>
          </div>
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Trigger onClick={execution.f}>
          {execution.label}
        </Trigger>
      </Grid>
    </Grid>
  )
}

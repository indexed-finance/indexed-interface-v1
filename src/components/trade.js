import React, { useContext, useEffect, useState } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
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
import style from '../assets/css/components/trade'
import { getPair, getRouter, decToWeiHex } from '../lib/markets'
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

  const handleChange = async(event) => {
    let { name, value } = event.target

    if(name == 'input') await setRate(value)
  }

  const setRate = async(entry) => {
    let { web3 } = state

    if(!isNaN(parseFloat(entry))) {
      let amount = 0

      if(web3.injected){
        let i = decToWeiHex(web3.injected, parseFloat(entry))
        let o = await getAmountOut(i)
        amount = parseFloat(o[1])/Math.pow(10, 18)
      } else {
        amount = entry * prices.input
      }

      setInput({ ...input, amount: entry })
      setOutput({ ...output, amount })
    }
  }

  const getAmountOut = async(i) => {
    return await contracts.router.methods.getAmountsOut(i, [ input.address, output.address]).call()
  }

  const getBalance = async(address) => {
    let { injected, rinkeby } = state.web3
    let provider = injected != false ? injected : rinkeby
    let target = injected != false ? state.account : '0x0000000000000000000000000000000000000001'

    let contract = toContract(provider, IERC20.abi, address)

    let balance = address == WETH ? await rinkeby.eth.getBalance(target)
    : await contract.methods.balanceOf(target).call()

    return parseFloat(balance/Math.pow(10,18)).toFixed(2)
  }

  const changeOrder = () => {
    let { injected, rinkeby } = state.web3
    let provider = injected != false ? injected : rinkeby
    let token = toContract(provider, IERC20.abi, output.address)

    setPrices({ input: prices.output, output: prices.input })
    setContracts({ ...contracts, token })
    setBalances({
      output: balances.input,
      input: balances.output
    })
    setInput({ ...output })
    setOutput({ ...input })
  }

  const swapTokens = async() => {
    let { web3, indexes } = state
    let { eth } = web3.injected

    let block = await eth.getBlock('latest')
    let amount0 = decToWeiHex(web3.injected, input.amount)
    let amount1 = decToWeiHex(web3.injected, output.amount)
    let f = () => {}

    if(input.address == WETH){
      f = () => swapEthForTokens(amount0, amount1, block)
    } else {
      f = swapTokensForEth(amount0, amount1, block)
     }

    dispatch({
      type: 'MESSAGE',
      payload: {
        show: true,
        title: 'CONFIRM ORDER',
        message: `You are about to swap ${input.amount} ${input.market} for ${output.amount} ${output.market}.`,
        actions: [
          { label: 'CONFIRM', f: f },
          { label: 'REJECT', f: null },
        ]
      }
    })
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
  .on('confirmation', async(conf, reciept) => {
       if(conf > 2) {
         let inputBalance = await getBalance(input.address)
         let outputBalance = await getBalance(output.address)

         setBalances({
           output: outputBalance,
           input: inputBalance
         })
       }
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
    .on('confirmation', async(conf, reciept) => {
       if(conf > 2) {
         let inputBalance = await getBalance(input.address)
         let outputBalance = await getBalance(output.address)

         setBalances({
           output: outputBalance,
           input: inputBalance
         })
       }
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

  const handleBalance  = async() => {
    let { amount } = state.balances[input.market]

    await setRate(amount)
  }

  useEffect(() => {
    const getPairMetadata = async() => {
      if(state.indexes[market]) {
        let { web3, indexes } = state
        let { address } = indexes[market]

        let router = await getRouter(web3.rinkeby)

        let pair = await getPair(web3.rinkeby, address)
        let token = toContract(web3.rinkeby, IERC20.abi, address)
        let pricing = await getMarketMetadata(pair.options.address)

        setOutput({ ...output, address: indexes[market].address })
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
      if(contracts.router.options != undefined
        && state.web3.injected != false){
        let allowance = await getAllowance()
        let { amount, address } = input

        if(allowance < parseFloat(amount) && address != WETH){
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
  }, [ input.amount ])

  useEffect(() => {
    const retrieveBalances = async() => {
      if(state.web3.injected != false
          && output.address != null){
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

  useEffect(() => {
    setExecution({
      f: swapTokens, label: 'SWAP'
    })
  }, [])

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
            endAdornment: <Adornment market={input.market}/>,
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

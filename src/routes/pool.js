import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useParams } from 'react-router-dom'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { toWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import ErrorOutline from '@material-ui/icons/ErrorOutline';

import Container from '../components/container'
import Spline from '../components/charts/spline'
import Canvas from '../components/canvas'
import Approvals from '../components/approvals'
import Weights from '../components/weights'
import List from '../components/list'
import ButtonTransaction from '../components/buttons/transaction'
import ButtonPrimary from '../components/buttons/primary'

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'

import PoolInitializer from '../assets/constants/abi/PoolInitializer.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import MockERC20ABI from '../assets/constants/abi/MockERC20.json'
import { eventColumns, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/pool'
import { getUnitializedPool, getPoolSnapshots, getTokenPriceHistory } from '../api/gql'
import { toContract } from '../lib/util/contracts'
import { decToWeiHex, getBalances } from '../lib/markets'
import { prepareOracle } from '../lib/index'
import { getEvents, balanceOf } from '../lib/erc20'
import { getPair } from '../lib/markets'
import getStyles from '../assets/css'
import { store } from '../state'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    credit: 0,
    history: []
}

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'

const useStyles = getStyles(style)

export default function Pools(){
  const [ balances, setBalances ] = useState({ native: 0, lp: 0, credit: 0 })
  const [ instance, setInstance ] = useState(null)
  const [ data, setData ] = useState(dummy)
  const [ events, setEvents ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { address } = useParams()
  let { native } = state

  const getCredit = async(targets) => {
    let element = document.getElementById('credit')
    let alternative = document.getElementById('eth-eqiv')
    let { toBN, toHex } = state.web3.rinkeby.utils
    let ethValue = 0
    let credit = 0

    if(targets.length <= 1){
      credit = await getCreditQuoteSingle(targets[0])
      ethValue = credit
      element.innerHTML = credit.toLocaleString(
          undefined, { minimumFractionDigits: 2 }
      ) + " ETH"
    } else {
      credit = await getCreditQuoteMultiple(targets, toBN(0))
      ethValue = parseFloat(credit.div(toBN(1e18)).toString())
      element.innerHTML = ethValue.toFixed(2) + " ETH"
    }

    alternative.innerHTML = '$' + parseFloat(ethValue * state.price).toFixed(2)
  }

  const claimCredits = async() => {
    let { web3, account } = state
    let { address } = instance.options

    try {
      let source = toContract(web3.injected, PoolInitializer.abi, address)

      await source.methods.claimTokens().send({ from: account })
      .on('confirmaton', (conf, receipt) => {
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
    } catch (e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
  }

  const getCreditQuoteSingle = async(asset) => {
    let { address, amount } = asset
    let value = decToWeiHex(state.web3.rinkeby, parseFloat(amount))
    let credit = await instance.methods.getCreditForTokens(address, value).call()

    return parseFloat(credit)/Math.pow(10, 18)
  }

  const getCreditQuoteMultiple = async(assets, total) => {
    for(let x in assets){
      let { address, amount } = assets[x]
      let value = decToWeiHex(state.web3.rinkeby, parseFloat(amount))
      let credit = await instance.methods.getCreditForTokens(address, value).call()
        .then(v => state.web3.rinkeby.utils.toBN(v))
        .catch(err => console.log(err))

      if (credit.eqn(0)) console.log(`Got zero credit output for ${address} amount ${amount}`);

      total = total.add(credit);
    }
    return total
  }

  const pledgeTokens = async() => {
    let { web3, account } = state
    let { address } = instance.options

    try {
      let source = toContract(web3.injected, PoolInitializer.abi, address)
      let [ addresses, amounts, output ] = await getInputs(web3.rinkeby)

      await source.methods.contributeTokens(
        addresses,
        amounts,
        output
      ).send({ from: account })
      .on('confirmaton', (conf, receipt) => {
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
    } catch(e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
  }

  const updateOracle = async() => {
    let { web3, account } = state
    await prepareOracle(web3.injected, account)
  }

  const getUnderlyingAssets = async() => {
    let { web3, account } = state

    for(let x in data.assets) {
      let { symbol, address } = data.assets[x]
      let amount = decToWeiHex(web3.injected, Math.floor(Math.random() * 10000))
      const token = new web3.injected.eth.Contract(MockERC20ABI, address)

      await token.methods.getFreeTokens(account, amount)
      .send({ from: account })
    }
  }

  const getInputs = async(web3) => {
    let { toBN } = web3.utils
    let [ inputs, targets ] = [ [], [] ]
    let value = 0

    for(let x in data.assets){
      let { name, address, symbol } = data.assets[x]
      let element = document.getElementsByName(symbol)[0]
      let value = parseFloat(element.value)

      if(!isNaN(value)){
        inputs.push(decToWeiHex(web3, value))
        targets.push(address)
      }
    }

    if(inputs.length > 1){
      let array = inputs.map((v, i) => { return { amount: v, address: targets[i] } })
      value = await getCreditQuoteMultiple(array, toBN(0))
    } else {
      let query = { address: targets[0], amount: inputs[0] }
      value = await getCreditQuoteSingle(query)
    }
    return [ targets, inputs, value ]
  }

  const getNativeBalances = async() => {
    let { web3, account } = state
    let pair = await getPair(web3.rinkeby, WETH, address)
    let target = web3.injected != false ? account : '0x0000000000000000000000000000000000000001'

    let lp = pair.options.address != '0x0000000000000000000000000000000000000000' ?
    await balanceOf(web3.rinkeby, pair.options.address, target) : 0
    let native = await balanceOf(web3.rinkeby, address, target)

    setBalances({ ...balances, native, lp })
  }

  const getActiveCredit = async() => {
    let { account, web3 } = state

    if(web3.injected && instance){
      let credit = await instance.methods.getCreditOf(account).call()
      credit = (parseFloat(credit)/Math.pow(10, 18))

      setBalances({ ...balances, credit })
    }
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes, web3 } = state

      if(Object.keys(indexes).length > 0){
        let target = Object.entries(indexes)
        .find(x => x[1].address == address)

        console.log(target)

        if(!target[1].active) {
          let pool = await getUnitializedPool(address)
          let source = toContract(state.web3.rinkeby, PoolInitializer.abi, pool[0].id)

          for(let token in pool[0].tokens){
            let { id } = pool[0].tokens[token]
            let address = id.split('-').pop()
            let contract = toContract(web3.rinkeby, IERC20.abi, address)
            let desired = await source.methods.getDesiredAmount(address).call()
            desired = (parseFloat(desired)/Math.pow(10,18)).toFixed(2)
            let symbol = await contract.methods.symbol().call()

            let { name } = tokenMetadata[symbol]

            target[1].assets.push({
              desired,
              address,
              symbol,
              name
            })
          }
          setInstance(source)
        } else {
          let tokenEvents = await getEvents(web3.websocket, address)

          setEvents(tokenEvents)
        }

        // await getNativeBalances()
        setData(target[1])
      }
    }
    retrievePool()
  }, [ state.indexes, state.request ])

  useEffect(() => {
    const retrieveBalances = async() => {
      let { account, web3 } = state
      let { assets } = data

      if(web3.injected){
        let balances =  await getBalances(web3.rinkeby, account, assets, {})

        await dispatch({ type: 'BALANCE',
          payload: { balances }
        })
      }
     }

    retrieveBalances()
    getActiveCredit()
  }, [ state.web3.injected ])

  useEffect(() => {
    if(state.web3.injected) getActiveCredit()
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let {
    marginX, margin, width, padding, chartHeight, fontSize, tableWidth
  } = style.getFormatting({ native })

  if(!data.active && !native) {
    let match = marginX.split(' ')

    match[0] = parseInt(match[0].replace('em', ''))
    match[0] = match[0] - (match[0] * 0.075)
    match[0] = `${match[0]}em`

    marginX = match.join(' ')
  }

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='stretch'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={6} lg={7} xl={7} style={{ width: '100%'}}>
          <ParentSize>
            {({ width, height }) => (
            <Canvas native={native} style={{ width: !native ? width : 'auto' }} custom='6.75%'>
              <div className={classes.market}>
                {!state.native && (
                  <Fragment>
                    <h2> {data.name} [{data.symbol}] </h2>
                    <h3> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h3>
                  </Fragment>
                )}
                {state.native && (
                  <Fragment>
                    <h3> {data.name} [{data.symbol}] </h3>
                    <h4> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h4>
                  </Fragment>
                )}
              </div>
              <div className={classes.chart}>
                <Spline ready={data != dummy} padding={padding} native={native} color='#ffa500' metadata={data} height={chartHeight} />
              </div>
              <div className={classes.stats} style={{ fontSize }}>
                <ul>
                  <li> LIQUIDITY: {data.marketcap} </li>
                  <li> MARKETCAP: {data.marketcap} </li>
                </ul>
              </div>
            </Canvas>
          )}
          </ParentSize>
          </Grid>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            {data.active && (
              <Container margin={margin} title='BALANCES' padding="1em 2em">
                <div className={classes.actions}>
                  <p> {data.symbol}: <span>{balances.native}</span></p>
                  <p> UNIV2-ETH-{data.symbol}: <span>{balances.lp}</span></p>
                  <a href={`https://app.uniswap.org/#/add/ETH/${address}`} style={{ float: 'left' }} target='_blank'>
                    <ButtonPrimary margin={{ marginBottom: 15, padding: '.5em 1.25em' }}  variant='outlined'> ADD LIQUIDITY </ButtonPrimary>
                  </a>
                  <a href={`https://app.uniswap.org/#/remove/${address}/ETH`} style={{ float: 'right' }} target='_blank'>
                    <ButtonPrimary margin={{ marginBottom: 15, padding: '.5em 1.25em' }}  variant='outlined'> REMOVE LIQUIDITY </ButtonPrimary>
                  </a>
                </div>
              </Container>
            )}
            <Container margin={margin} padding="1em 0em" title='ASSETS'>
              {!data.active && (
                <div className={classes.alert}>
                  <Fragment>
                    <ErrorOutline style={{ float: 'left', fontSize: '2em', marginBottom: -7.5, marginRight: 10, color: 'orange'}} />
                    <label> This index pool is uninitialized and needs liquidity </label>
                  </Fragment>
                </div>
              )}
              <div className={classes.container} style={{ width }}>
                {!data.active && (
                  <Fragment>
                    <Approvals input={data != dummy} param='DESIRED' height={250} metadata={data} set={getCredit}/>
                    <div className={classes.reciept}>
                      <p> ENTITLED TO: <span id='credit'/></p>
                      <p> PLEDGE: <span id='eth-eqiv'/></p>
                    </div>
                    <div className={classes.submit}>
                      <ButtonPrimary variant='outlined' onClick={pledgeTokens} style={{ marginLeft: 0 }}>
                        INITIALISE
                      </ButtonPrimary>
                    </div>
                  </Fragment>
                )}
                {data.active && (
                  <div className={classes.assets}>
                    <Grid container direction='column' alignItems='center' justify='space-around'>
                      {data.assets.map(asset => (
                        <Grid item>
                          <div className={classes.asset}>
                            <Weights asset={asset} />
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                )}
              </div>
            </Container>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%' }}>
          <ParentSize>
            {({ width, height }) => (
              <Container margin={marginX} padding="1em 2em" title='EVENTS'>
                <div className={classes.events}>
                  <List height={250} columns={eventColumns} data={events} />
                </div>
              </Container>
            )}
          </ParentSize>
        </Grid>
      </Grid>
    </Fragment>
  )
}

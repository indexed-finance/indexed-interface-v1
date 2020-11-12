import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useParams } from 'react-router-dom'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { toWei, fromWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import ErrorOutline from '@material-ui/icons/ErrorOutline';

import Container from '../components/container'
import Spline from '../components/charts/spline'
import Canvas from '../components/canvas'
import Weights from '../components/weights'
import List from '../components/list'
import ButtonPrimary from '../components/buttons/primary'
import { formatBalance } from '@indexed-finance/indexed.js'
import Alert from '@material-ui/lab/Alert';

import {
  TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER, UNCLAIMED_CREDITS
} from '../assets/constants/parameters'

import PoolInitializer from '../assets/constants/abi/PoolInitializer.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import MockERC20ABI from '../assets/constants/abi/MockERC20.json'
import { eventColumns, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/pool'

import { toContract } from '../lib/util/contracts'
import { decToWeiHex, getBalances } from '../lib/markets'
import { getEvents, balanceOf } from '../lib/erc20'
import { getPair } from '../lib/markets'
import getStyles from '../assets/css'

import { store } from '../state'
import InitializerForm from '../components/pool/initializer-form'
import { InitializerStateProvider, useInitializerState} from '../state/initializer'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    credit: 0,
    history: [],
    type: <span> &nbsp;&nbsp;&nbsp;&nbsp;</span>
}

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'

const useStyles = getStyles(style)

function Pool(){
  const { initState } = useInitializerState();
  const [ balances, setBalances ] = useState({ native: 0, lp: 0, credit: 0 })
  const [ instance, setInstance ] = useState(null)
  const [ events, setEvents ] = useState([])
  const [ data, setData ] = useState(dummy)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { address } = useParams()
  let { native } = state

  const findHelper = (i) => {
    let res = i.uninitialized.find(i => i.pool.initializer.address === address);

    return !res ? i.initialized.find(i => i.pool.address === address) : res
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

  const getNativeBalances = async() => {
    let { web3, account } = state
    let pair = await getPair(web3.rinkeby, WETH, address)
    let target = web3.injected != false ? account : '0x0000000000000000000000000000000000000001'

    let lp = pair.options.address != '0x0000000000000000000000000000000000000000' ?
    fromWei(await balanceOf(web3.rinkeby, pair.options.address, target)): 0
    let native = fromWei(await balanceOf(web3.rinkeby, address, target))

    lp = parseFloat(lp).toFixed(2)
    native = parseFloat(native).toFixed(2)

    setBalances({ ...balances, native, lp })
  }

  const getActiveCredit = async() => {
    let { account, web3 } = state

    if(web3.injected && instance){
      let credit = await instance.methods.getCreditOf(account).call()
      credit = (parseFloat(credit)/Math.pow(10, 18))

      if(credit == 0) {
        dispatch({
          type: 'FLAG',
          payload: UNCLAIMED_CREDITS
        })
      }
      setBalances({ ...balances, credit })
    }
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes, web3, helper } = state

      if(Object.keys(indexes).length > 0 && !instance){
        let target = Object.entries(indexes)
        .find(x => x[1].address == address)
        let { active } = target[1]
        let poolInitializer = findHelper(helper)
        let { pool } = poolInitializer
        let initializerAddress = !active ? pool.initializer.address : pool.address

        let contract = toContract(
          web3.rinkeby, PoolInitializer.abi, initializerAddress
        )

        if(!active) {
          let { totalCreditedWETH } = pool.initializer
          let accreditedEth = formatBalance(totalCreditedWETH, 18, 4)

          target[1].assets = poolInitializer.pool.initializer.tokens
          target[1].credit = accreditedEth
          target[1].type = 'TARGETS'
        } else {
          let tokenEvents = await getEvents(web3.websocket, address)
          target[1].assets = poolInitializer.pool.tokens
          target[1].type = 'EVENTS'

          setEvents(tokenEvents)
        }

        setInstance(contract)
        setData(target[1])
      }
    }
    retrievePool()
  }, [ state.indexes ])

  useEffect(() => {
    const retrieveBalances = async() => {
      let { account, web3 } = state
      let { assets } = data

      if(web3.injected){
        let balances =  await getBalances(
          web3.rinkeby, account, assets, {}
        )
        await dispatch({ type: 'BALANCE',
          payload: { balances }
        })
        await getNativeBalances()
        await getActiveCredit()
      }
     }
    retrieveBalances()
  }, [ state.web3.injected ])

  useEffect(() => {
    if(!state.load) {
      dispatch({ type: 'LOAD', payload: true })
    }
  }, [])

  let {
    marginX, margin, width, padding, chartHeight, fontSize, tableWidth
  } = style.getFormatting({ native })

  if(!data.active && !native) {
    let match = marginX.split(' ')

    match[0] = parseInt(match[0].replace('em', ''))
    match[0] = match[0] - (match[0] * 0.25)
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
                  {data.active && (
                    <Fragment>
                      <li> MARKETCAP: ${data.marketcap.toLocaleString()} </li>
                      <li> VOLUME: ${data.volume.toLocaleString()} </li>
                    </Fragment>
                  )}
                  {!data.active && (
                    <Fragment>
                      <li> POOL CREDIT: Ξ {data.credit} </li>
                      <li> YOUR CREDIT: Ξ 0 </li>
                    </Fragment>
                  )}
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
                    <ButtonPrimary onClick={getUnderlyingAssets} margin={{ marginBottom: 15, padding: '.5em 1.25em' }}  variant='outlined'> GET TOKENS </ButtonPrimary>
                </div>
              </Container>
            )}
            <Container margin={margin} padding="1em 0em" title='ASSETS'>
              {!data.active && (
                <div className={classes.alert}>
                  <Alert variant="outlined" severity="warning" style={{  borderWidth: 2 }}>
                    THIS POOL IS UNINITIALIZED
                  </Alert>
                </div>
              )}
              <div className={classes.container} style={{ width }}>
                {!data.active && (
                  <InitializerForm metadata={{ address }} classes={classes} />
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
              <Container margin={marginX} padding="1em 0em" title={data.type}>
                {data.active && (
                  <div className={classes.events}>
                    <List height={250} columns={eventColumns} data={events} />
                  </div>
                )}
                {!data.active && (
                  <Grid container direction='row' alignItems='flex-start' justify='space-evenly'>
                    <div className={classes.targets} style={{ width }}>
                      {initState.tokens.map((v, i) => {
                        let { address } = v
                        let label = 'item'

                        if(i == 0) label = 'first'
                        else if(i == data.assets.length-1) label = 'last'

                       return <Target label={label} i={i} asset={v} />
                      })}
                    </div>
                  </Grid>
                )}
              </Container>
            )}
          </ParentSize>
        </Grid>
      </Grid>
    </Fragment>
  )
}

function Target({ label, asset, i }){
  const { useToken, initState: { pool } } = useInitializerState();
  const token = useToken(i)
  const { address, decimals } = asset
  const market = pool.tokenPrices[address]
  const price = market ? parseFloat(market.toString()): 0

  return(
    <Grid item style={{ width: '100%' }} className={label}>
      <div style={{ width: '60%'}}>
       <Weights asset={token} />
      </div>
      <div style={{ marginTop: '-2em', float: 'right', width: '40%'}}>
       <label> Ξ {((price * token.currentBalance)).toLocaleString()} </label>
     </div>
   </Grid>
  )
}

export default function Route() {
  return(
    <InitializerStateProvider>
      <Pool />
    </InitializerStateProvider>
  )
}

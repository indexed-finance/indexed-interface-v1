import React, { Fragment, useState, useEffect, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { fromWei, toWei } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import Container from '../container'
import Spline from '../charts/spline'
import Canvas from '../canvas'
import Weights from '../weights'
import List from '../list'
import ButtonPrimary from '../buttons/primary'

import { UNCLAIMED_CREDITS } from '../../assets/constants/parameters'

import MockERC20ABI from '../../assets/constants/abi/MockERC20.json'
import PoolInitializer from '../../assets/constants/abi/PoolInitializer.json'
import { eventColumns } from '../../assets/constants/parameters'
import style from '../../assets/css/routes/pool'

import { toContract } from '../../lib/util/contracts'
import { getBalances } from '../../lib/markets'
import { getEvents, balanceOf } from '../../lib/erc20'
import { getPair } from '../../lib/markets'
import getStyles from '../../assets/css'

import { store } from '../../state'
import copyToClipboard from '../../lib/copyToClipboard';
import Copyable from '../copyable';

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'

const useStyles = getStyles(style)

function InitializedPoolPage({ address, metadata }){
  const [ balances, setBalances ] = useState({ native: 0, lp: 0, credit: 0 })
  const [ instance, setInstance ] = useState(null)
  const [ events, setEvents ] = useState([])
  const classes = useStyles()
  let { state, dispatch } = useContext(store)
  let { native, request } = state

  const findHelper = (i) => {
    return i.initialized.find(i => i.pool.address === address);
  }

  const getNativeBalances = async() => {
    let { web3, account } = state
    let pair = await getPair(web3[process.env.REACT_APP_ETH_NETWORK], WETH, address)
    let target = web3.injected !== false ? account : '0x0000000000000000000000000000000000000001'

    let lp = pair.options.address !== '0x0000000000000000000000000000000000000000' ?
      fromWei(await balanceOf(web3[process.env.REACT_APP_ETH_NETWORK], pair.options.address, target)): 0
      let native = fromWei(await balanceOf(web3[process.env.REACT_APP_ETH_NETWORK], address, target))

    lp = parseFloat(lp).toFixed(2)
    native = parseFloat(native).toFixed(2)

    setBalances({ ...balances, native, lp })
  }

  const getActiveCredit = async() => {
    let { account, web3 } = state

    if(web3.injected && instance){
      let credit = await instance.methods.getCreditOf(account).call()
      credit = (parseFloat(credit)/Math.pow(10, 18))

      if(credit > 0) {
        dispatch({
          type: 'FLAG',
          payload: UNCLAIMED_CREDITS
        })
      }
      setBalances({ ...balances, credit })
    }
  }

  const getUnderlyingAssets = async() => {
  let { web3, account, helper } = state
  let pool = findHelper(helper)

  for(let x in pool.tokens) {
    let { symbol, address } = pool.tokens[x]
    let amount = toWei(Math.floor(Math.random() * 10000))
    const token = new web3.injected.eth.Contract(MockERC20ABI, address)

    await token.methods.getFreeTokens(account, amount)
    .send({ from: account })
    }
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes, web3, helper } = state

      if(Object.keys(indexes).length > 0 && !instance
      && metadata.address !== '0x0000000000000000000000000000000000000000'){
        let target = Object.entries(indexes).find(x => x[1].address === address)
        let pool = findHelper(helper)
        let initializerAddress = pool.address;

        let contract = toContract(
          web3[process.env.REACT_APP_ETH_NETWORK], PoolInitializer.abi, initializerAddress
        )

        let tokenEvents = await getEvents(web3.websocket, address)
        target[1].assets = pool.tokens
        target[1].type = 'EVENTS'

        setEvents(tokenEvents)
        setInstance(contract)
      }
    }
    retrievePool()
  }, [ state.indexes ])

  useEffect(() => {
    const retrieveBalances = async() => {
      let { account, web3 } = state
      let { assets } = metadata

      if(web3.injected){
        let balances =  await getBalances(
          web3[process.env.REACT_APP_ETH_NETWORK], account, assets, {}
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

  let {
    marginX, margin, width, padding, chartHeight, fontSize, percent, balanceHeight, paddingRight
  } = style.getFormatting({ native, request, active: true })

  let { name, symbol } = metadata;

  function MetaDisplay() {
    if (!native) {
      return (
      <Fragment>
        <h2> {name} [{symbol}] </h2>
        <div style={{ marginTop: 15 }}>
          <Copyable text={address} float='right'>
            <h3>{address.substring(0, 6)}...{address.substring(38, 64)}</h3>
          </Copyable>
        </div>
      </Fragment>
      )
    }
    return (
    <Fragment>
      <h3> {name} [{symbol}] </h3>
      <div style={{ marginTop: 5} }>
        <Copyable text={address}>
          <h4>{address.substring(0, 6)}...{address.substring(38, 64)}</h4>
        </Copyable>
      </div>
    </Fragment>
    )
  }

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={6} lg={7} xl={7} style={{ width: '100%'}}>
          <ParentSize>
            {({ width, height }) => (
            <Canvas native={native} style={{ width: !state.native ? width : 'auto', margin }} custom={percent}>
              <div className={classes.market}>
                <MetaDisplay />
              </div>
              <div className={classes.chart}>
                <Spline
                  ready={state.request}
                  padding={padding}
                  absolute={false}
                  native={native}
                  color='#ffa500'
                  metadata={{ history: metadata.liquidity }}
                  height={chartHeight}
                />
              </div>
              <div className={classes.stats} style={{ fontSize }}>
                <ul>
                  <Fragment>
                    <li style={{ paddingRight }}> MARKETCAP: ${metadata.marketcap.toLocaleString()} </li>
                    <li> VOLUME: ${metadata.volume.toLocaleString()} </li>
                  </Fragment>
                </ul>
              </div>
            </Canvas>
          )}
          </ParentSize>
          </Grid>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Container margin={margin} title='BALANCES' padding="1em 0em">
              <div className={classes.actions} style={{ height: balanceHeight }}>
                <p> {metadata.symbol}: <span>{balances.native}</span></p>
                <p> UNIV2-ETH-{metadata.symbol}: <span>{balances.lp}</span></p>
                <a href={`https://app.uniswap.org/#/add/ETH/${address}`} style={{ float: 'left' }} target='_blank'>
                  <ButtonPrimary margin={{ marginBottom: 15, padding: '.5em 1.25em' }}  variant='outlined'> ADD LIQUIDITY </ButtonPrimary>
                </a>
                <a href={`https://app.uniswap.org/#/add/ETH/${address}`} style={{ float: 'right' }} target='_blank'>
                  <ButtonPrimary margin={{ margin: 0, padding: '.5em 1.25em' }}  variant='outlined'> ADD LIQUIDITY </ButtonPrimary>
                </a>
              </div>
            </Container>
            <Container margin={margin} padding="1em 0em" title='ASSETS'>
              <div className={classes.container} style={{ width }}>
                <div className={classes.assets}>
                  <Grid container direction='column' alignItems='center' justify='space-around'>
                    {metadata.assets.map((asset, i) => (
                      <Grid item key={i}>
                        <div className={classes.asset}>
                          <Weights native={state.native} asset={asset} />
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </div>
            </Container>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%' }}>
          <ParentSize>
            {({ width, height }) => (
              <Container margin={marginX} padding="1em 0em" title="EVENTS">
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

export default function InitializedPool(props) {
  return(
    <InitializedPoolPage {...props} />
  )
}

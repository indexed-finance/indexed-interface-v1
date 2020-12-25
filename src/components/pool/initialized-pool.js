import React, { Fragment, useState, useEffect, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { fromWei, toWei, BigNumber, formatBalance } from '@indexed-finance/indexed.js';

import Container from '../container'
import Spline from '../charts/spline'
import Canvas from '../canvas'
import Weights from '../weights'
import List from '../list'
import ButtonPrimary from '../buttons/primary'

import { UNCLAIMED_CREDITS, TX_PENDING, TX_REVERTED, TX_CONFIRMED } from '../../assets/constants/parameters'
import { ZERO_ADDRESS } from '../../assets/constants/addresses'

import { eventNativeColumns, eventDesktopColumns } from '../../assets/constants/parameters'
import MockERC20ABI from '../../assets/constants/abi/MockERC20.json'
import PoolInitializer from '../../assets/constants/abi/PoolInitializer.json'
import style from '../../assets/css/routes/pool'

import { toContract } from '../../lib/util/contracts'
import { getEvents, balanceOf } from '../../lib/erc20'
import { getPair } from '../../lib/markets'
import getStyles from '../../assets/css'

import { store } from '../../state'
import Copyable from '../copyable';

const useStyles = getStyles(style)

function InitializedPoolPage({ address, metadata }){
  const [ balances, setBalances ] = useState({ native: 0, lp: 0, credit: 0 })
  const [ showAlert, setAlert ] = useState(false)
  const [ events, setEvents ] = useState([])
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { native, request } = state

  const findHelper = (i) => {
    return i.initialized.find(i => i.pool.address === address);
  }

  const getNativeBalances = async() => {
    let { web3, account } = state
    let pair = await getPair(web3[process.env.REACT_APP_ETH_NETWORK], process.env.REACT_APP_WETH, address)
    let target = web3.injected !== false ? account : '0x0000000000000000000000000000000000000001'

    let lp = pair.options.address !== '0x0000000000000000000000000000000000000000' ?
      fromWei(await balanceOf(web3[process.env.REACT_APP_ETH_NETWORK], pair.options.address, target)): 0
      let native = fromWei(await balanceOf(web3[process.env.REACT_APP_ETH_NETWORK], address, target))

    lp = parseFloat(lp).toFixed(2)
    native = parseFloat(native).toFixed(2)

    setBalances({ ...balances, native, lp })
  }

  const claimTokens = async() => {
    let { helper, web3, account } = state
    let pool = findHelper(helper)
    let contract = toContract(web3.injected, PoolInitializer.abi, pool.initializer)

    return await contract.methods.claimTokens().send({ from: account })
    .on('transactionHash', (transactionHash) => {
      dispatch({ type: 'MODAL', payload: { show: false }})
      dispatch(TX_PENDING(transactionHash))
    }).on('confirmation', async(conf, receipt) => {
      if(conf == 0){
        if(receipt.status == 1) {
          dispatch(TX_CONFIRMED(receipt.transactionHash))
        } else {
          dispatch(TX_REVERTED(receipt.transactionHash))
        }
      }
    })
  }

  const getActiveCredit = async() => {
    let { account, web3, helper } = state
    let pool = findHelper(helper)

    if(web3.injected && pool){
      let contract = toContract(web3.injected, PoolInitializer.abi, pool.initializer)
      let credit = await contract.methods.getCreditOf(account).call()
      credit = formatBalance(new BigNumber(credit), 18, 4)

      if(credit > 0 && !showAlert) {
        setAlert(true)
        dispatch({
          type: 'MODAL',
          payload: UNCLAIMED_CREDITS(claimTokens, credit)
        })
      }
    }
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { web3 } = state

      if(events.length == 0 && metadata.address !== ZERO_ADDRESS){
        let provider = web3.websocket[process.env.REACT_APP_ETH_NETWORK]
        let tokenEvents = await getEvents(provider, address)

        setEvents(tokenEvents)

        if(web3.injected){
          await getActiveCredit()
          await getNativeBalances()
        }
      }
    }
    retrievePool()
  }, [ , metadata ])

  let {
    marginX, margin, width, padding, chartHeight, fontSize, percent, balanceHeight, paddingRight, progressWidth
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
    <div style={{ width: 237.5 }}>
      <h3 style={{ color: document.body.style.color }}> {name} [{symbol}] </h3>
      <div style={{ marginTop: 2.5 }}>
        <Copyable text={address}>
          <h4>{address.substring(0, 6)}...{address.substring(38, 64)}</h4>
        </Copyable>
      </div>
    </div>
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
              <div className={classes.market} style={{ position: 'absolute' }}>
                <MetaDisplay />
              </div>
              <div className={classes.chart}>
                <Spline
                  ready={metadata.address !== ZERO_ADDRESS}
                  metadata={{
                    address: metadata.address,
                    history: metadata.liquidity
                  }}
                  height={chartHeight}
                  label='LIQUIDITY'
                  padding={padding}
                  absolute={false}
                  native={native}
                  color='#ffa500'
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
                <a href={`https://app.uniswap.org/#/add/ETH/${address}`} style={{ float: 'left' }} rel="noopener noreferrer" target='_blank'>
                  <ButtonPrimary margin={{ marginBottom: 15, padding: '.5em 1.25em' }}  variant='outlined'> ADD LIQUIDITY </ButtonPrimary>
                </a>
                <a href={`https://app.uniswap.org/#/remove/${address}/ETH`} style={{ float: 'right' }} rel="noopener noreferrer" target='_blank'>
                  <ButtonPrimary margin={{ margin: 0, padding: '.5em 1.25em' }}  variant='outlined'> REMOVE LIQUIDITY </ButtonPrimary>
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
                          <Weights width={progressWidth} native={state.native} asset={asset} />
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
                  <List height={250} columns={state.native ? eventNativeColumns : eventDesktopColumns} data={events} />
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

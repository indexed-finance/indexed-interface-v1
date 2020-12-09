import React, { Fragment, useState, useContext, useEffect } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'

import StakingRewardsFactory from '../assets/constants/abi/StakingRewardsFactory.json'
import IStakingRewards from '../assets/constants/abi/IStakingRewards.json'
import Countdown from "react-countdown";
import CountUp from 'react-countup';
import { toWei, formatBalance, BigNumber } from '@indexed-finance/indexed.js'

import { TX_CONFIRMED, TX_PENDING, TX_REVERTED } from '../assets/constants/parameters'
import { STAKING_FACTORY, WETH } from '../assets/constants/addresses'

import style from '../assets/css/routes/supply'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Input from '../components/inputs/input'
import NumberFormat from '../utils/format'

import { tokenMetadata } from '../assets/constants/parameters'
import { getStakingPool } from '../api/gql'
import { allowance, getERC20 } from '../lib/erc20'
import { decToWeiHex, getPair } from '../lib/markets'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const i = {
  'GOV5r': [ 'BAL', 'YFI', 'CRV', 'UNI'],
  'UNIV2:ETH-GOV5r': [ 'UNI', 'YFI', 'CRV', 'BAL']
}

function uncapitalizeNth(text, n) {
    return (n > 0 ? text.slice(0, n) : '') + text.charAt(n).toLowerCase() + (n < text.length - 1 ? text.slice(n+1) : '')
}

export default function Supply() {
  const [ execution, setExecution ] = useState({ f: () => {}, label: 'STAKE' })
  const [ stats, setStats ] = useState({ claim: 0, deposit: 0, balance: 0 })
  const [ metadata, setMetadata ] = useState({ supply: 0, rate: 0 })
  const [ input, setInput ] = useState(null)
  const [ shouldQuery, setQuery ] = useState(false)

  let { state, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()
  let ticker = uncapitalizeNth(asset.toUpperCase(), asset.length-1)

  const findHelper = (asset) => {
    return state.helper.initialized.find(i =>
      i.pool.symbol == uncapitalizeNth(asset, asset.length-1)
    );
  };

  const initialisePool = async(addr) => {
    let { web3, account } = state

    try{
      let contract = toContract(web3.injected, StakingRewardsFactory, STAKING_FACTORY)

      await contract.methods.notifyRewardAmount(addr).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            setMetadata({ ...metadata, isReady: true })
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  const getAllowance = async() => {
    let { web3, account } = state
    let { id, stakingToken } = metadata

    let budget = await allowance(web3[process.env.REACT_APP_ETH_NETWORK], stakingToken, account, id)

    return formatBalance(new BigNumber(budget), 18, 4)
  }

  const approve = async() => {
    let { web3, account } = state
    let { stakingToken, id } = metadata

    try{
      let contract = getERC20(web3.injected, stakingToken)

      await contract.methods.approve(id, toWei(input)).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            setExecution({ f: stake, label: 'STAKE' })
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  const stake = async() => {
    let { web3, account } = state
    let { id } = metadata

    setQuery(false)

    try {
      let contract = toContract(web3.injected, IStakingRewards, id)
      let amount = decToWeiHex(web3[process.env.REACT_APP_ETH_NETWORK], parseFloat(input))

      await contract.methods.stake(amount).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            setQuery(true)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch (e) {}
  }

  const claim = async() => {
    let { web3, account } = state
    let { id } = metadata

    setQuery(false)

    try {
      let contract = toContract(web3.injected, IStakingRewards, id)

      await contract.methods.exit().send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            setQuery(true)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  const handleInput = (event) => {
    let { value } = event.target
    let raw = !isNaN(parseFloat(value)) ? value : 0
    let weight = getPoolWeight(raw)

    let estimatedRatio = (metadata.rate * weight)
    let estimatedReward = estimatedRatio > metadata.rate ? metadata.rate : estimatedRatio
    let displayWeight = weight > 1 ? (weight - ((metadata.supply + raw)/raw))/weight * 100 : weight/2 * 100

    document.getElementById('est').innerHTML =
    estimatedReward.toLocaleString({ minimumFractionDigits: 2 })
    document.getElementById('weight').innerHTML =
    displayWeight.toLocaleString({ minimumFractionDigits: 2 })

    setInput(event.target.value)
  }

  const getPoolWeight = (value) => {
    let currentWeight = metadata.supply === 0 ? 1 : metadata.supply
    let inputWeight = parseFloat(value)/(parseFloat(currentWeight) + parseFloat(value))

    return inputWeight
  }

  const getAccountMetadata = async(obj) => {
    let { web3, account } = state

    if(web3.injected && obj) {
      let { stakingToken, id } = obj
      let contract = toContract(web3.rinkeby, IStakingRewards, id)
      let token = getERC20(web3.rinkeby, stakingToken)
      let claim = await contract.methods.earned(account).call()
      let totalSupply = await contract.methods.totalSupply().call()
      let deposit = await contract.methods.balanceOf(account).call()
      let balance = await token.methods.balanceOf(account).call()
      let supply = formatBalance(new BigNumber(totalSupply), 18, 4)
      let today = new Date(Date.now())
      let tomorrow = new Date(today.getTime() + 86400)

      balance = formatBalance(new BigNumber(balance), 18, 4)
      deposit = formatBalance(new BigNumber(deposit), 18, 4)
      claim = formatBalance(new BigNumber(claim), 18, 4)

      let relative = parseFloat((deposit)/parseFloat(supply))

      let returns = obj.rate * (isNaN(relative) ? 0 : relative)
      let future = returns != obj.rate ? parseFloat(claim) + returns : claim
      let display = returns.toLocaleString({ minimumFractionDigits: 2 })

      setStats({ claim, deposit, balance, returns, future, display })
    }
  }

  useEffect(() => {
    const getMetadata = async() => {
      let { web3, request, helper } = state

      if(request && helper) {
        let match = ticker.split('-')
        let target = match[match.length-1]

        let { pool } = findHelper(target)
        let isWethPair = ticker.includes('UNI')
        let data = await getStakingPool(pool.address, isWethPair)
        let {
          id, startsAt, stakingToken, rewardRate, isReady
         } = data

        if(isWethPair) {
          let pair = await getPair(web3.rinkeby, WETH, pool.address)

          data.stakingToken = pair.options.address
          stakingToken = pair.options.address
        }

        let contract = toContract(web3.rinkeby, IStakingRewards, id)
        let totalSupply = await contract.methods.totalSupply().call()
        let supply = formatBalance(new BigNumber(totalSupply), 18, 4)
        let reward = formatBalance(new BigNumber(rewardRate), 18, 4)
        let rate = reward/(supply == 0 ? 1 : supply)

        if(isReady) {
          setExecution({
            f: () => initialisePool(stakingToken), label: 'INITIALIZE'
          })
        } else {
          setExecution({
            f: stake, label: 'STAKE'
          })
        }

        data.rate = rate * 60 * 60 * 24
        data.supply = supply

        setMetadata(data)

        if(web3.injected !== false){
          await getAccountMetadata(data)
        }
      }
    }
    getMetadata()
  }, [ state.request, shouldQuery ])

  useEffect(() => {
    const checkAllowance = async() => {
      let { web3 } = state
      let obj = Object.entries(metadata)

      if(web3.injected && input !== null && obj.length > 0) {
        let amount = parseFloat(input)
        let allowance = await getAllowance()

        if(allowance === 0 || amount > allowance){
          setExecution({ f: approve, label: 'APPROVE'})
        } else {
          setExecution({ f: stake, label: 'STAKE'
          })
        }
      }
    }
    checkAllowance()
  }, [ input ])

  let {
    padding, marginBottom, margin, marginRight, claimMargin, width, positioning, inputWidth, listPadding, button, height, reward, buttonPos, marginLeft, infoWidth
  } = style.getFormatting({ ticker, native: state.native })

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        <Canvas native={state.native} style={{ overflowX: 'hidden', margin }}>
          <div className={classes.rewards} style={{ width: reward }}>
            <p> NDX EARNED </p>
            <div>
              {!state.native && (
                <h2 style={{ marginLeft: claimMargin }}>
                  <CountUp decimals={6} perserveValue separator="," start={stats.claim} end={stats.future} duration={86400} /> NDX
                </h2>
              )}
              {state.native && (
                <h3 style={{ marginLeft: claimMargin }}>
                  <CountUp decimals={6} perserveValue separator="," start={stats.claim} end={stats.future} duration={86400} /> NDX
                </h3>
              )}
              <ButtonPrimary disabled={!state.web3.injected} onClick={claim} variant='outlined'
                 margin={{ marginTop: buttonPos, marginBottom: 12.5, marginRight: 37.5 }}>
                CLAIM
              </ButtonPrimary>
            </div>
            <ul className={classes.list}>
              <li> DEPOSIT: {stats.deposit} {!state.native && (<>{ticker}</>)}</li>
              <li> RATE: {stats.display} NDX/DAY</li>
            </ul>
          </div>
        </Canvas>
      </div>
    </Grid>
      <Grid item xs={10} md={6}>
        <Container margin='1em 0em 1em 0em' padding="1em 2em" title={ticker}>
          <div className={classes.modal} style={{ padding, height }}>
            <Grid container direction='row' alignItems='center' justify={positioning} spacing={4}>
              {metadata.isReady && (
                <Fragment>
                  <Grid item>
                    <img alt='asset-1' src={tokenMetadata[i[ticker][0]].image} style={{ marginRight, width, marginBottom }} />
                    <img alt='asset-2' src={tokenMetadata[i[ticker][1]].image} style={{marginBottom: 25, width: 30 }} />
                    <img alt='asset-3' src={tokenMetadata[i[ticker][2]].image} style={{ marginLeft: -25, width: 30 }} />
                    <img alt='asset-4' src={tokenMetadata[i[ticker][3]].image} style={{ marginBottom: 10, width: 30 }} />
                  </Grid>
                  <Grid item>
                    <Input label="AMOUNT" variant='outlined'
                      onChange={handleInput}
                      value={input}
                      style={{
                        width: inputWidth
                      }}
                      InputProps={{
                        inputComponent: NumberFormat
                      }}
                      helperText={
                        <o className={classes.helper}> BALANCE: {stats.balance} </o>
                      }
                    />
                  </Grid>
                </Fragment>
             )}
             {!metadata.isReady && metadata.startsAt && (
                <Grid item xs={6} md={12}>
                  <p>This program is not yet initialised yet, it is possible to do so in </p>
                  <p> <Countdown date={metadata.startsAt}/> </p>
                </Grid>
             )}
            </Grid>
            {metadata.isReady && (
              <ul className={classes.estimation} style={{ padding: listPadding }}>
                <li> EST REWARD: <span id='est'>0</span> NDX/DAY </li>
                <li> POOL WEIGHT: <span id='weight'>0</span>% </li>
              </ul>
            )}
          </div>
          <ButtonPrimary disabled={!state.web3.injected} onClick={execution.f} variant='outlined' margin={{ ...button }}>
            {execution.label}
          </ButtonPrimary>
        </Container>
      </Grid>
      <Grid item xs={10} md={6}>
        <Canvas>
          <div className={classes.rewards} style={{ width: !state.native ? reward : infoWidth }}>
          	<ul className={classes.stats}>
              <li> POOL DEPOSITS: <span>
                  {metadata.supply.toLocaleString({ minimumFractionDigits: 2 })}
                  {!state.native && (<> {ticker}</>)}
                </span>
              </li>
              <li> POOL RATE: <span>
                  {metadata.rate.toLocaleString({ minimumFractionDigits: 2 })} NDX/DAY
                </span>
              </li>
            </ul>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

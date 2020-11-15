import React, { Fragment, useState, useContext, useEffect, useRef } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'
import { FormControl } from '@material-ui/core';

import StakingRewardsFactory from '../assets/constants/abi/StakingRewardsFactory.json'
import IStakingRewards from '../assets/constants/abi/IStakingRewards.json'
import Countdown from "react-countdown";
import CountUp from 'react-countup';
import { toWei, fromWei, formatBalance, BigNumber } from '@indexed-finance/indexed.js'

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import style from '../assets/css/routes/supply'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Input from '../components/inputs/input'
import NumberFormat from '../utils/format'

import { tokenMetadata } from '../assets/constants/parameters'
import { getStakingPool } from '../api/gql'
import { balanceOf, allowance, getERC20 } from '../lib/erc20'
import { decToWeiHex, getBalances } from '../lib/markets'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

const FACTORY = '0xF53FF1A3962Ea1CCA3F3D90Cb5C22EF3484858b0'
const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'

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
  const [ metadata, setMetadata ] = useState({})
  const [ input, setInput ] = useState(null)

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
      let contract = toContract(web3.injected, StakingRewardsFactory, FACTORY)

      await contract.methods.notifyRewardAmount(addr).send({ from: account })
      .on('confirmation', (conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            dispatch({ type: 'FLAG', payload: TX_CONFIRM })
            setMetadata({ ...metadata, isReady: true })
          } else {
            dispatch({ type: 'FLAG', payload: TX_REVERT })
          }
        }
      }).catch((data) => {
        dispatch({ type: 'FLAG', payload: TX_REJECT })
      })
    } catch(e) {
      console.log(e)
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }


  }

  const getAllowance = async() => {
    let { web3, account } = state
    let { id, stakingToken } = metadata

    let budget = await allowance(web3.injected, stakingToken, account, id)

    return parseFloat(budget)/Math.pow(10, 18)
  }

  const approve = async() => {
    let { web3, account } = state
    let { stakingToken, id } = metadata

    try{
      let contract = getERC20(web3.injected, stakingToken)
      let amount = decToWeiHex(web3.rinkeby, parseFloat(input))

      await contract.methods.approve(id, amount).send({ from: account })
      .on('confirmation', (conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            dispatch({ type: 'FLAG', payload: TX_CONFIRM })
            setExecution({ f: stake, label: 'STAKE' })
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

  const stake = async() => {
    let { web3, account } = state
    let { id } = metadata

    try {
      let contract = toContract(web3.injected, IStakingRewards, id)
      let amount = decToWeiHex(web3.rinkeby, parseFloat(input))

      await contract.methods.stake(amount).send({ from: account })
      .on('confirmation', (conf, receipt) => {
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

  const handleInput = (event) => {
    let { value } = event.target
    let weight = getPoolWeight(value)

    let estimatedReward = getEstimatedReward(value, weight)
    let estimation = document.getElementById('est')
    let presence = document.getElementById('weight')

    estimation.innerHTML = estimatedReward.toLocaleString({ minimumFractionDigits: 2 })
    presence.innerHTML = weight.toLocaleString({ minimumFractionDigits: 2 })

    setInput(event.target.value)
  }

  const getEstimatedReward = (value, weight) => {
    let { rate } = metadata

    return parseFloat(rate) * weight
  }

  const getPoolWeight = (value) => {
    let { totalSupply } = metadata
    let poolWeight = (parseFloat(totalSupply)/Math.pow(10, 18))

    return parseFloat(value)/poolWeight * 100
  }

  const getAccountMetadata = async(obj) => {
    let { web3, account } = state

    if(web3.injected && obj) {

      let { stakingToken, totalSupply, id } = obj
      let contract = toContract(web3.rinkeby, IStakingRewards, id)
      let token = getERC20(web3.rinkeby, stakingToken)
      let claim = await contract.methods.earned(account).call()
      let deposit = await contract.methods.balanceOf(account).call()
      let balance = await token.methods.balanceOf(account).call()
      let supply = formatBalance(new BigNumber(totalSupply), 18, 4)
      let today = new Date(Date.now())
      let tomorrow = new Date(today.getTime() + 86400)

      balance = formatBalance(new BigNumber(balance), 18, 4)
      deposit = formatBalance(new BigNumber(deposit), 18, 4)
      claim = formatBalance(new BigNumber(claim), 18, 4)

      let relative = parseFloat((claim)/(supply + claim))
      let returns = obj.rate * (isNaN(relative) ? 1 : relative)
      let future =  returns == obj.rate ? 0 : parseFloat(claim + returns)
      let display = returns

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
          id, startsAt, stakingToken, totalSupply, trewardRate, rewardRate, isReady,
         } = data
        let contract = toContract(web3.rinkeby, IStakingRewards, id)
        let supply = formatBalance(new BigNumber(totalSupply), 18, 4)
        let reward = formatBalance(new BigNumber(rewardRate), 18, 4)
        let rate = reward/(supply == 0 ? 1 : supply)

        if(!isReady) {
          setExecution({
            f: () => initialisePool(target), label: 'INITIALIZE'
          })
        } else {
          setExecution({
            f: stake, label: 'STAKE'
          })
        }

        data.rate = rate * (60^2) * 24
        data.supply = supply

        setMetadata(data)

        if(web3.injected != false){
          await getAccountMetadata(data)
        }
      }
    }
    getMetadata()
  }, [ state.request ])

  useEffect(() => {
    const checkAllowance = async() => {
      let { web3 } = state
      let obj = Object.entries(metadata)

      if(web3.injected && obj.length > 0) {
        let amount = parseFloat(input)
        let allowance = await getAllowance()

        if(amount > allowance){
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
    padding, marginBottom, marginRight, width, positioning, inputWidth, listPadding, button, height, reward, buttonPos, marginLeft
  } = style.getFormatting(ticker, state.native)

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        <Canvas style={{ overflowX: 'hidden' }}>
          <div className={classes.rewards} style={{ width: reward }}>
            <p> ACTIVE CLAIM </p>
            <div>
              <h2> <CountUp decimals={6} perserveValue separator="," start={stats.claim} end={stats.future} duration={86400} /> NDX </h2>
              <ButtonPrimary variant='outlined' margin={{ marginTop: buttonPos, marginBottom: 12.5, marginRight: 37.5 }}>
                CLAIM
              </ButtonPrimary>
            </div>
            <ul className={classes.list}>
              <li> DEPOSIT: {stats.deposit} {asset.toUpperCase()}</li>
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
                    <img src={tokenMetadata[i[ticker][0]].image} style={{ marginRight, width, marginBottom }} />
                    <img src={tokenMetadata[i[ticker][1]].image} style={{marginBottom: 25, width: 30 }} />
                    <img src={tokenMetadata[i[ticker][2]].image} style={{ marginLeft: -25, width: 30 }} />
                    <img src={tokenMetadata[i[ticker][3]].image} style={{ marginBottom: 10, width: 30 }} />
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
          <ButtonPrimary onClick={initialisePool} variant='outlined' margin={{ ...button }}>
            {execution.label}
          </ButtonPrimary>
        </Container>
      </Grid>
      <Grid item xs={10} md={6} style={{ width: '45%'}}>
        <Canvas>
          <div className={classes.rewards}>
          	<ul className={classes.stats}>
              <li> POOL DEPOSITS: <span style={{ marginLeft }}> {metadata.supply} NDX</span> </li>
              <li> POOL RATE: <span style={{ marginLeft }}> {metadata.rate} NDX/DAY </span> </li>
            </ul>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

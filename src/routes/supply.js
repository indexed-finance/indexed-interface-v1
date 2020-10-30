import React, { Fragment, useState, useContext, useEffect, useRef } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'
import { FormControl } from '@material-ui/core';

import StakingRewardsFactory from '../assets/constants/abi/StakingRewardsFactory.json'
import IStakingRewards from '../assets/constants/abi/IStakingRewards.json'
import Countdown from "react-countdown";
import CountUp from 'react-countup';

import { TX_CONFIRM, TX_REJECT, TX_REVERT } from '../assets/constants/parameters'
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

const FACTORY = '0x48ea38bcd50601594191b9e4edda7490d7a9eb16'

const z = {
  'DFI5R': '0xe376e56cdebdf4f47049933a8b158b6f25d42dbd',
  'UNIV2:ETH-DFI5R': '0xfaadac001786d4dfaaf3eece747c46f285967f2d',
  'GOVI6': '',
  'UNIV2:ETH-GOVI6': ''
}

const i = {
  'DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK'],
  'UNIV2:ETH-DFI5R': [ 'UNI', 'WBTC', 'COMP', 'LINK' ],
  'GOVI6': [ 'BAL', 'YFI', 'CRV', 'UNI'],
  'UNIV2:ETH-GOVI6': [ 'UNI', 'YFI', 'CRV', 'BAL']
}

export default function Supply() {
  const [ execution, setExecution ] = useState({ f: () => {}, label: 'STAKE' })
  const [ stats, setStats ] = useState({ claim: 0, deposit: 0, balance: 0 })
  const [ metadata, setMetadata ] = useState({})
  const [ input, setInput ] = useState(null)

  let { state, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()
  let ticker = asset.toUpperCase()

  const initialisePool = async() => {
    let { web3, account } = state
    let { stakingToken } = metadata
    let contract = toContract(web3.injected, StakingRewardsFactory, FACTORY)

    await contract.methods.notifyRewardAmount(stakingToken).send({ from: account })
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
  }

  const getAllowance = async() => {
    let stakingPool = z[ticker]
    let { web3, account } = state
    let { stakingToken } = metadata

    let budget = await allowance(web3.injected, stakingToken, account, stakingPool)

    return parseFloat(budget)/Math.pow(10, 18)
  }

  const approve = async() => {
    let stakingPool = z[ticker]
    let { web3, account } = state
    let { stakingToken } = metadata
    let contract = getERC20(web3.injected, stakingToken)
    let amount = decToWeiHex(web3.injected, parseFloat(input))

    await contract.methods.approve(stakingPool, amount).send({ from: account })
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
  }

  const stake = async() => {
    let stakingPool = z[ticker]
    let { web3, account } = state
    let contract = toContract(web3.injected, IStakingRewards, stakingPool)
    let amount = decToWeiHex(web3.injected, parseFloat(input))

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
  }

  const handleInput = (event) => {
    let { value } = event.target
    let weight = getPoolWeight(value)

    let estimatedReward = getEstimatedReward(value, weight)
    let estimation = document.getElementById('est')
    let presence = document.getElementById('weight')

    estimation.innerHTML = estimatedReward
    presence.innerHTML = weight

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
    let stakingPool = z[ticker]
    let { stakingToken, totalSupply } = metadata
    let { web3, account } = state

    if(obj == undefined){
       obj = Object.entries(metadata)
    }

    if(web3.injected && obj.length > 0){
      let contract = toContract(web3.rinkeby, IStakingRewards, stakingPool)
      let token = getERC20(web3.rinkeby, stakingToken)
      let claim = await contract.methods.earned(account).call()
      let deposit = await contract.methods.balanceOf(account).call()
      let balance = await token.methods.balanceOf(account).call()
      let tomorrow = new Date(Date.now())
      let supply = (parseFloat(totalSupply)/Math.pow(10,18))
      let today = tomorrow

      balance = (parseFloat(balance)/Math.pow(10,18))
      deposit = (parseFloat(deposit)/Math.pow(10,18))
      claim = (parseFloat(claim)/Math.pow(10,18))

      let returns = metadata.per * (claim)/(supply+claim)
      let future =  claim + returns
      let display = returns.toLocaleString({ minimumFractionDigits: 2 })

      tomorrow = new Date(tomorrow.getTime() + 86400)
      tomorrow = (tomorrow.getTime() - today.getTime())

      setStats({ claim, deposit, balance, returns, future, display })
    }
  }

  useEffect(() => {
    const getMetadata = async() => {
      let { web3 } = state
      let stakingAddress = z[ticker]
      let data = await getStakingPool(stakingAddress)
      let { totalSupply, rewardRate, stakingToken, isReady } = data
      let rate = (parseFloat(rewardRate)/parseFloat(totalSupply))
      let contract = toContract(web3.rinkeby, IStakingRewards, stakingAddress)

      if(parseFloat(totalSupply) == 0){
        rate = (parseFloat(rewardRate)/Math.pow(10, 18))
      } if(!isReady) {
        setExecution({
          f: initialisePool, label: 'INITIALIZE'
        })
      } else {
        setExecution({
          f: stake, label: 'STAKE'
        })
      }
      data.rate = parseFloat(rate * 60 * 24).toLocaleString()
      data.per = rate * 60 * 24

      setMetadata(data)

      if(web3.injected != false){
        await getAccountMetadata(data)
      }
    }
    getMetadata()
  }, [])

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

  useEffect(() => {
    getAccountMetadata()
  }, [ state.web3.injected ])

  let width = ticker.includes('UNIV2') ? 50 : 30
  let marginRight = ticker.includes('UNIV2') ? 7.5 : 0
  let marginBottom = ticker.includes('UNIV2') ? 0 : 10

  if(state.web3.injected) getAccountMetadata()

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        <Canvas>
          <div className={classes.rewards}>
            <p> ACTIVE CLAIM </p>
            <div>
              <h2> <CountUp decimals={6} perserveValue separator="," start={stats.claim} end={stats.future} duration={86400} /> NDX </h2>
              <ButtonPrimary variant='outlined' margin={{ marginTop: -50 }}>
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
          <div className={classes.modal}>
            <Grid container direction='row' alignItems='center' justify='space-evenly'>
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
             {!metadata.isReady && (
                <Grid item>
                  This program is not yet initialised yet, it is possible to do so in
                  <p> <Countdown date={parseInt(metadata.startsAt) * 1000}/> </p>
                </Grid>
             )}
            </Grid>
            {metadata.isReady && (
              <ul className={classes.estimation}>
                <li> EST REWARD: <span id='est'>0</span> NDX/DAY </li>
                <li> POOL WEIGHT: <span id='weight'>0</span>% </li>
              </ul>
            )}
          </div>
          <ButtonPrimary onClick={execution.f} variant='outlined' margin={{ marginTop: -50, marginRight: 25 }}>
            {execution.label}
          </ButtonPrimary>
        </Container>
      </Grid>
      <Grid item xs={10} md={6}>
        <Canvas>
          <div className={classes.rewards}>
          	<ul className={classes.stats}>
              <li> POOL DEPOSITS: <span> $0.00 </span> </li>
              <li> POOL RATE: <span> {metadata.rate} NDX/DAY </span> </li>
            </ul>
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

import React, { Fragment, useState, useContext, useEffect } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'
import CountUp from 'react-countup';

import StakingRewardsFactory from '../assets/constants/abi/StakingRewardsFactory.json'
import IStakingRewards from '../assets/constants/abi/IStakingRewards.json'
import { formatBalance, toTokenAmount, toWei, toBN } from '@indexed-finance/indexed.js'

import { TX_CONFIRMED, TX_PENDING, TX_REVERTED } from '../assets/constants/parameters'
import { STAKING_FACTORY } from '../assets/constants/addresses'

import style from '../assets/css/routes/supply'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Input from '../components/inputs/input'
import NumberFormat from '../utils/format'

import { tokenMetadata } from '../assets/constants/parameters'
import { getERC20 } from '../lib/erc20'
import { toContract } from '../lib/util/contracts'
import getStyles from '../assets/css'
import { store } from '../state'
import { useStakingState } from '../state/staking/context';

const useStyles = getStyles(style)

export default function Supply() {
  const [ execution, setExecution ] = useState({ f: () => {}, label: 'STAKE' })
  const [ stats, setStats ] = useState({ claim: 0, deposit: 0, balance: 0 })
  const [ metadata, setMetadata ] = useState({ supply: 0, rate: 0 })
  const [ input, setInput ] = useState(null)
  const [ shouldQuery, setQuery ] = useState(false)
  const [ tokens, setTokens ] = useState([])
  const { useStakingPool } = useStakingState();

  let { state, dispatch, handleTransaction } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()
  let ticker = asset.toUpperCase()
  const pool = useStakingPool(ticker);

  const initializePool = async(addr) => {
    let { web3, account } = state

    let contract = toContract(web3.injected, StakingRewardsFactory, STAKING_FACTORY)
    const fn = contract.methods.notifyRewardAmount(pool.pool.stakingToken);

    await handleTransaction(fn.send({ from: account }))
      .then(async () => {
        await pool.pool.updatePool();
      }).catch(() => {});
  }

  const approve = async() => {
    let { web3, account } = state

    try{
      let contract = getERC20(web3.injected, pool.pool.pool.stakingToken);
      const fn = contract.methods.approve(pool.pool.rewardsAddress, toTokenAmount(input, 18));
      await handleTransaction(fn.send({ from: account }))
      .then(async () => {
        pool.pool.updatePool();
      }).catch(() => {});
    } catch(e) {}
  }

  const stake = async() => {
    let { web3, account } = state

    try {
      let contract = toContract(web3.injected, IStakingRewards, pool.pool.rewardsAddress);

      let amount = toTokenAmount(input, 18)
      const fn = contract.methods.stake(amount);
      await handleTransaction(fn.send({ from: account }))
      .then(async () => {
        pool.pool.updatePool();
      }).catch(() => {});
    } catch (e) {}
  }

  const claimReward = async() => {
    let { web3, account } = state
    let poolAddress = pool.pool.pool.address

    setQuery(false)

    try {
      let contract = toContract(web3.injected, IStakingRewards, poolAddress)

      await contract.methods.exit().send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', (conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
            pool.pool.updatePool();
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  const handleInput = (event) => {
    let { value } = event.target
    let raw = !isNaN(parseFloat(value)) ? parseFloat(value) : 0

    if (!pool.pool) {
      setInput(event.target.value)
      return;
    }
    const { pool: { totalSupply } } = pool.pool;
    const supply = parseFloat(formatBalance(totalSupply, 18, 10));
    let weight;
    if (totalSupply.eq(0)) {
      weight = 1;
    } else {
      const newSupply = supply + raw;
      weight = raw / newSupply;
    }
    let estimatedReward = parseFloat(formatBalance(pool.pool.pool.rewardRate.times(86400), 18, 10)) * weight;

    let displayWeight = weight * 100;

    document.getElementById('est').innerHTML = estimatedReward.toLocaleString({ minimumFractionDigits: 2 })
    document.getElementById('weight').innerHTML = displayWeight.toLocaleString({ minimumFractionDigits: 2 })

    setInput(event.target.value)
  }

  let {
    padding,
    marginBottom, margin, marginRight, claimMargin, marginLeft,
    width, positioning, inputWidth, listPadding ,
    button, height, reward, buttonPos,
    infoWidth
  } = style.getFormatting({ ticker, native: state.native });

  const imgStyles = [
    { width, marginRight, marginBottom },
    { marginBottom: 25, width: 30 },
    { marginLeft: -25, width: 30 },
    { marginBottom: 10, width:30  }
  ];

  function UserData() {
    let userEarnedRewards = pool.pool && pool.pool.userEarnedRewards ? pool.pool.userEarnedRewards : toBN(0)
    let userBalanceRewards = pool.pool && pool.pool.userBalanceRewards ? pool.pool.userBalanceRewards : toBN(0)
    let totalSupply = pool.pool ? pool.pool.pool.totalSupply : toBN(0)
    let rewardRate = pool.pool ? pool.pool.pool.rewardRate : toBN(0)

    if(totalSupply.eq(0)){
      totalSupply = toWei(1)
    }

    const dailySupply = rewardRate.times(86400).times(toWei(1)).div(totalSupply);
    const relativeWeight = userBalanceRewards.div(totalSupply);
    const expectedReturns = dailySupply.times(relativeWeight);
    const futureRewards = expectedReturns.plus(userEarnedRewards);
    const earnedDisplay = parseFloat(formatBalance(userEarnedRewards, 18, 6));
    const returnsDisplay = parseFloat(formatBalance(futureRewards, 18, 6));
    const rateDisplay = formatBalance(expectedReturns, 18, 2);
    const stakedDisplay = formatBalance(userBalanceRewards, 18, 6);
    const supplyDisplay = formatBalance(totalSupply, 18, 6);

    return (
      <Canvas native={state.native} style={{ overflowX: 'hidden', margin }}>
        <div className={classes.rewards} style={{ width: reward }}>
          <p> REWARD </p>
          <div>
            {!state.native && (
              <h2 style={{ marginLeft: claimMargin }}>
                <CountUp useEasing={false} redraw decimals={6} perserveValue separator="," start={earnedDisplay} end={returnsDisplay} duration={86400} /> NDX
              </h2>
            )}
            {state.native && (
              <h3 style={{ marginLeft: claimMargin }}>
                <CountUp useEasing={false} redraw decimals={6} perserveValue separator="," start={earnedDisplay} end={returnsDisplay} duration={86400} /> NDX
              </h3>
            )}
            <ButtonPrimary
              disabled={userBalanceRewards.eq(0)}
              onClick={claimReward}
              variant='outlined'
              margin={{ marginTop: buttonPos, marginBottom: 12.5, marginRight: 37.5 }}
            >
              CLAIM
            </ButtonPrimary>
          </div>
          <ul className={classes.list}>
            <li> STAKED: {stakedDisplay} {!state.native && (<>{ticker}</>)}</li>
            <li> RATE: {rateDisplay} NDX/DAY</li>
          </ul>
        </div>
      </Canvas>
    )
  }

  function FormInput() {
    let disableInput = !pool.pool || !pool.pool.pool.active;

    if (disableInput) {
      return <Input label="AMOUNT" variant='outlined'
        onChange={handleInput}
        value={input}
        disabled={true}
        style={{ width: inputWidth }}
        InputProps={{ inputComponent: NumberFormat }}
      />
    }
    const { userBalanceStakingToken } = pool.pool;
    const displayBalance = userBalanceStakingToken ? formatBalance(userBalanceStakingToken, 18, 4) : '0';
    const setAmountToBalance = () => handleInput({ target: { value: displayBalance }})

    const inputWei = !!input && toTokenAmount(input, 18);
    const sufficientBalance = (userBalanceStakingToken && inputWei) && userBalanceStakingToken.gte(inputWei);
    const error = inputWei && !!(state.web3.injected) && !sufficientBalance;
    const helperText = error ? 'INSUFFICIENT BALANCE' : <o onClick={setAmountToBalance} className={classes.helper}> BALANCE: {displayBalance} </o>;
    return <Input label="AMOUNT" variant='outlined'
      onChange={handleInput}
      error={!!error}
      value={input}
      style={{ width: inputWidth }}
      InputProps={{ inputComponent: NumberFormat }}
      helperText={helperText}
    />
  }

  function FormButton() {
    if (!pool.pool) {
      return <ButtonPrimary
        disabled={true}
        variant='outlined'
        margin={{ ...button }}
      >
        INITIALIZE
      </ButtonPrimary>
    }
    const {
      pool: { isReady, active },
      userBalanceStakingToken,
      userAllowanceStakingToken,
    } = pool.pool;

    if (isReady && !active) {
      return <ButtonPrimary
        disabled={!state.web3.injected}
        onClick={initializePool}
        variant='outlined'
        margin={{ ...button }}
      >
        INITIALIZE
      </ButtonPrimary>
    }
    if (active) {
      const inputWei = !!input && toTokenAmount(input, 18);
      const sufficientApproval = userAllowanceStakingToken && userAllowanceStakingToken.gte(inputWei);
      const sufficientBalance = (userBalanceStakingToken && inputWei) && userBalanceStakingToken.gte(inputWei);
      if (!sufficientBalance) {
        return <ButtonPrimary
          disabled={true}
          variant='outlined'
          margin={{ ...button }}
        >
          STAKE
        </ButtonPrimary>
      }
      if (!sufficientApproval) {
        return <ButtonPrimary
          disabled={!state.web3.injected}
          onClick={approve}
          variant='outlined'
          margin={{ ...button }}
        >
          APPROVE
        </ButtonPrimary>
      }
      return <ButtonPrimary
        onClick={stake}
        variant='outlined'
        margin={{ ...button }}
      >
        STAKE
      </ButtonPrimary>
    }
  }

  function DisplayMetadata() {
    let claimed, rewards, rate, staked, stakingTokenSymbol;
    if (!pool.pool) {
      [claimed, rewards, rate, staked, stakingTokenSymbol] = [0, 0, 0, 0, ''];
    } else {
      const { pool: { totalSupply, claimedRewards, rewardRate, totalRewards } } = pool.pool;
      if (pool.metadata) {
        stakingTokenSymbol = pool.metadata.stakingSymbol;
      }

      let currentSupply = totalSupply.eq(0) ? toWei(1) : totalSupply

      console.log(totalSupply.eq(0))

      const dailySupply = rewardRate.times(86400).times(toWei(1)).div(currentSupply);
      claimed = parseFloat(formatBalance(claimedRewards, 18, 2));
      rate = parseFloat(formatBalance(dailySupply, 18, 2));
      staked = parseFloat(formatBalance(totalSupply, 18, 2));
      rewards = parseFloat(formatBalance(totalRewards, 18, 2));
    }
    return (
      <ul className={classes.stats}>
        <li> STAKED {ticker}: <span>
            {staked.toLocaleString()}
          </span>
        </li>
        <li> NDX PER DAY: <span>
            {rate.toLocaleString()}
          </span>
        </li>
        {
          !state.native &&
          <Fragment>
            <li> TOTAL NDX: <span>
                {rewards.toLocaleString()}
              </span>
            </li>
            <li> CLAIMED NDX: <span>
                {claimed.toLocaleString()}
              </span>
            </li>
          </Fragment>
        }
      </ul>
    )
  }

  useEffect(() => {
    // Ensure that if a pool is using a UNIV2 token for staking, to
    // format images in occurance and if not render as is
    const sortDisplayImages = () => {
      if(!pool.pool && !pool.metadata) return;
      else if(tokens.length > 0) return;

      let targetArr = pool.metadata.indexPoolTokenSymbols.slice(0, 4)
      let findExisting = targetArr.find(i => i == 'UNI')

      if(!ticker.includes('UNI')) {
        setTokens(targetArr)
      } else {
        if(findExisting) {
          targetArr[targetArr.indexOf(findExisting)] = targetArr[0]
          targetArr[0] = findExisting
        } else {
          targetArr[0] = 'UNI'
        }
        setTokens(targetArr)
      }
    }
    sortDisplayImages()
  }, [ , pool.metadata ])

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        { UserData() }
      </div>
    </Grid>
      <Grid item xs={10} md={6}>
        <Container margin='1em 0em 1em 0em' padding="1em 2em" title={ticker}>
          <div className={classes.modal} style={{ padding, height }}>
            <Grid container direction='row' alignItems='center' justify={positioning} spacing={4}>
                <Fragment>
                  <Grid item>
                    {tokens.map(
                      (symbol, i) => <img alt={`asset-${i}`} src={tokenMetadata[symbol].image} style={imgStyles[i]} />
                    )}
                  </Grid>
                  <Grid item>
                    { FormInput() }
                  </Grid>
                </Fragment>
            </Grid>
            {pool.pool && pool.pool.pool.isReady && (
              <ul className={classes.estimation} style={{ padding: listPadding }}>
                <li> EST REWARD: <span id='est'>0</span> NDX/DAY </li>
                <li> POOL WEIGHT: <span id='weight'>0</span>% </li>
              </ul>
            )}
          </div>
          { FormButton() }
        </Container>
      </Grid>
      <Grid item xs={10} md={6}>
        <Canvas>
          <div className={classes.rewards} style={{ width: !state.native ? reward : infoWidth }}>
          	{ DisplayMetadata() }
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

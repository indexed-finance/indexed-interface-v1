import React, { Fragment, useState, useContext, useEffect } from 'react'

import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'
import CountUp from 'react-countup';

import StakingRewardsFactory from '../assets/constants/abi/StakingRewardsFactory.json'
import IStakingRewards from '../assets/constants/abi/IStakingRewards.json'
import { formatBalance, toTokenAmount, toWei, toBN, toHex } from '@indexed-finance/indexed.js'

import { categoryMetadata, TX_CONFIRMED, TX_PENDING, TX_REVERTED } from '../assets/constants/parameters'
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
import EtherScanLink from '../components/buttons/etherscan-link';
import Web3RequiredPrimaryButton from '../components/buttons/web3-required-primary';
import { BigNumber } from 'ethers';
import { useTheme } from '@material-ui/core/styles';
const dateFormat = require("dateformat");

const useStyles = getStyles(style)

export default function Supply() {
  const [ input, setInput ] = useState(null)
  const [ tokens, setTokens ] = useState([])
  const { useStakingPool } = useStakingState();

  const theme =  useTheme()
  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  let { state, native, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()
  let ticker = asset.toUpperCase()
  const pool = useStakingPool(ticker);

  useEffect(() => {
    async function update() {
      pool.pool.updatePromise = pool.pool.updatePool();
      await pool.pool.updatePromise;
    }
    if (pool && pool.pool) update();
  }, [])

  const initializePool = async (addr) => {
    let { web3, account } = state

    try {
      let tokenAddress = pool.pool.stakingToken;
      console.log(`STAKING TOKEN ${tokenAddress}`)
      const factory =  pool.pool.pool.indexPool === '0x126c121f99e1e211df2e5f8de2d96fa36647c855'.toLowerCase()
        ? '0x4246863cf318f930a955f4BaB2a9277c21E3b0bB'
        : STAKING_FACTORY;
      let contract = toContract(web3.injected, StakingRewardsFactory, factory)
      console.log(await contract.methods.notifyRewardAmount(tokenAddress).call())

      await contract.methods.notifyRewardAmount(tokenAddress)
      .send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            await pool.pool.updatePool();
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch (e) {}
  }

  const approve = async() => {
    let { web3, account } = state

    try{
      let rewardsAddress = pool.pool.rewardsAddress
      let stakingToken = pool.pool.pool.stakingToken
      let contract = getERC20(web3.injected, stakingToken)
      let value = BigNumber.from(2).pow(128).toHexString();
      await contract.methods.approve(rewardsAddress, value)
      .send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            await pool.pool.updatePool();
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) { console.log(e) }
  }

  const stake = async() => {
    let { web3, account } = state

    try {
      let { rewardsAddress } = pool.pool
      let contract = toContract(web3.injected, IStakingRewards, rewardsAddress)
      let amount = toTokenAmount(input, 18)

      await contract.methods.stake(toHex(amount)).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            await pool.pool.updatePool();
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
            await setInput(null)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch (e) { }
  }

  const claimReward = async() => {
    let { web3, account } = state

    try {
      let poolAddress = pool.pool.pool.address
      let contract = toContract(web3.injected, IStakingRewards, poolAddress)

      await contract.methods.getReward().send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            await pool.pool.updatePool();
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
            await setInput(null)
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) {}
  }

  const exit = async () => {
    let { web3, account } = state

    try {
      let poolAddress = pool.pool.pool.address
      let contract = toContract(web3.injected, IStakingRewards, poolAddress)

      await contract.methods.exit().send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status == 1) {
            await pool.pool.updatePool();
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
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
    width, positioning, inputWidth, listPadding , button2Pos,
    button, height, reward, buttonPos, secondary,
    containerPadding, fontSize,
    infoWidth
  } = style.getFormatting({ ticker, native: state.native });

  const imgStyles = [
    { width, marginRight, marginBottom },
    { marginBottom: 25, width: secondary },
    { marginLeft: -25, width: secondary },
    { marginBottom: 10, width:secondary  }
  ];

  function UserData() {
    let userEarnedRewards = pool.pool && pool.pool.userEarnedRewards ? pool.pool.userEarnedRewards : toBN(0)
    let userBalanceRewards = pool.pool && pool.pool.userBalanceRewards ? pool.pool.userBalanceRewards : toBN(0)
    let totalSupply = pool.pool ? pool.pool.pool.totalSupply : toBN(0)
    let rewardRate = pool.pool ? pool.pool.pool.rewardRate : toBN(0)

    if(totalSupply.eq(0)){
      totalSupply = toWei(1)
    }

    const dailySupply = rewardRate.times(86400);
    const relativeWeight = userBalanceRewards.div(totalSupply);
    const expectedReturns = dailySupply.times(relativeWeight);
    const futureRewards = expectedReturns.plus(userEarnedRewards);
    const earnedDisplay = parseFloat(formatBalance(userEarnedRewards, 18, 6));
    const returnsDisplay = parseFloat(formatBalance(futureRewards, 18, 6));
    const rateDisplay = formatBalance(expectedReturns, 18, 2);
    const stakedDisplay = formatBalance(userBalanceRewards, 18, 6);
    const supplyDisplay = formatBalance(totalSupply, 18, 6);

    return (
      <Canvas native={native} /* padding={containerPadding} */ style={{ overflowX: 'hidden', margin }}  title={native ? 'REWARDS' : 'USER REWARDS'}>
        <div className={classes.rewards} style={{ width: reward }}>
          <p>EARNED REWARDS</p>
          <div>
            {!native ? <h2>{earnedDisplay} NDX</h2> : <h3>{earnedDisplay} NDX</h3> }
          </div>
          <ul className={classes.list}>
            {
              relativeWeight.gt(0) && <li>WEIGHT: {parseFloat((relativeWeight.toNumber() * 100).toFixed(4))}%</li>
            }

            <li> STAKED: {stakedDisplay} {!native && (<>{ticker}</>)}</li>
            <li> RATE: {rateDisplay} NDX/DAY</li>
          </ul>
          <div className={classes.buttonBox}>
            <ButtonPrimary
              disabled={userBalanceRewards.eq(0)}
              onClick={claimReward}
              variant='outlined'
              margin={buttonPos}
            >
              CLAIM
            </ButtonPrimary>
            <ButtonPrimary
              disabled={userBalanceRewards.eq(0)}
              onClick={exit}
              variant='outlined'
              margin={button2Pos}
            >
              EXIT
            </ButtonPrimary>
          </div>
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
      let [disabled, label, onClick] =
        !sufficientBalance
          ? [true, 'STAKE', () => {}]
          : !sufficientApproval
            ? [!state.web3.injected, 'APPROVE', approve]
            : [false, 'STAKE', stake];

      return <Web3RequiredPrimaryButton
        disabled={disabled}
        label={label}
        onClick={onClick}
        variant='outlined'
        margin={{ ...button }}
      />
    }
  }

  function DisplayMetadata() {
    let claimed, rewards, rate, staked, stakingTokenSymbol, dateEnd;
    let poolAddress;

    function StakingTokenLink() {
      if (!pool.pool) {
        return <></>
      }
      if (pool.pool.pool.isWethPair) {
        return <a
          href={`https://v2.info.uniswap.org/pair/${pool.pool.stakingToken}`}
          target='_blank'
          rel='noreferrer noopener'
        >
          {stakingTokenSymbol}
        </a>
      }
      return <Link to={`/index/${stakingTokenSymbol}`}>{stakingTokenSymbol}</Link>
    }

    if (!pool.pool) {
      [claimed, rewards, rate, staked, stakingTokenSymbol, dateEnd, poolAddress] = [0, 0, 0, 0, '', '', ''];
    } else {
      const { pool: { totalSupply, claimedRewards, rewardRate, totalRewards, periodFinish } } = pool.pool;
      const endDate = new Date(periodFinish * 1000);
      if (native) {
        dateEnd = dateFormat(endDate, 'mm-dd-yy h:mm') + ' UTC';
      } else {
        dateEnd = dateFormat(endDate, 'mmm d, yyyy, h:MM TT') + ' UTC';
      }
      if (pool.metadata) {
        stakingTokenSymbol = pool.metadata.stakingSymbol;
      }

      const dailySupply = rewardRate.times(86400);
      claimed = parseFloat(formatBalance(claimedRewards, 18, 2));
      rate = parseFloat(formatBalance(dailySupply, 18, 2));
      staked = parseFloat(formatBalance(totalSupply, 18, 2));
      rewards = parseFloat(formatBalance(totalRewards, 18, 2));
      poolAddress = pool.pool.pool.address
    }

    return (
      <ul className={classes.stats}>
        <li>
          REWARDS POOL: <span>
            {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
            <EtherScanLink network={process.env.REACT_APP_ETH_NETWORK} type='account' entity={poolAddress} />
          </span>
        </li>
        <li>STAKING ENDS: <span> {dateEnd} </span> </li>
        <li> STAKED {ticker}: <span>
            {staked.toLocaleString()}
          </span>
        </li>
        <li> NDX PER DAY: <span>
            {rate.toLocaleString()}
          </span>
        </li>
        {
          !native &&
          <Fragment>
            <li> TOTAL NDX: <span>
                {rewards.toLocaleString()}
              </span>
            </li>
            <li> STAKING TOKEN: <span>
                <StakingTokenLink />
              </span>
            </li>
            {/* <li> CLAIMED NDX: <span>
                {claimed.toLocaleString()}
              </span>
            </li> */}
          </Fragment>
        }
      </ul>
    )
  }

  function DisplayImages() {
    if (!pool.pool || !pool.metadata || !pool.pool.pool) return <></>;
    const isWethPair = pool.pool.pool.isWethPair;
    const category = pool.metadata.poolCategory;
    return <div>
      { category && <img alt={`asset-2`} src={categoryMetadata[category]?.normal[mode]} style={imgStyles[2]} /> }
      { isWethPair && <img alt={`asset-3`} src={tokenMetadata['ETH'].image} style={imgStyles[3]} /> }
    </div>
  }

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6}>
      <div className={classes.top}>
        { UserData() }
      </div>
    </Grid>
      <Grid item xs={10} md={6}>
        <Container margin='1em 0em 1em 0em' padding={containerPadding} title={ticker}>
          <div className={classes.modal} style={{ padding, height }}>
            <Grid container direction='row' alignItems='center' justify={positioning} spacing={4}>
              <Grid item>
                {/* {tokens.map(
                  (symbol, i) => <img alt={`asset-${i}`} src={tokenMetadata[symbol].image} style={imgStyles[i]} />
                )} */}
                {/* <img alt={`asset-${i}`} src={tokenMetadata[symbol].image} style={imgStyles[i]} /> */}
                <DisplayImages />
              </Grid>
              <Grid item>
                { FormInput() }
              </Grid>
            </Grid>
            {pool.pool && pool.pool.pool.isReady && (
              <ul className={classes.estimation} style={{ fontSize, padding: listPadding }}>
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
          <div className={classes.rewards} style={{ width: !native ? reward : infoWidth }}>
          	{ DisplayMetadata() }
          </div>
        </Canvas>
      </Grid>
    </Grid>
  )
}

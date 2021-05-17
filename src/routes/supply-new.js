import React, { Fragment, useState, useContext, useEffect } from 'react'

import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import { useParams } from  'react-router-dom'
import MultiTokenStaking from '../assets/constants/abi/MultiTokenStaking.json'
import { formatBalance, toTokenAmount, toWei, toBN, toHex } from '@indexed-finance/indexed.js'

import { categoryMetadata, TX_CONFIRMED, TX_PENDING, TX_REVERTED } from '../assets/constants/parameters'

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
import EtherScanLink from '../components/buttons/etherscan-link';
import Web3RequiredPrimaryButton from '../components/buttons/web3-required-primary';
import { BigNumber } from 'ethers';
import { useTheme } from '@material-ui/core/styles';
import { useNewStakingState } from '../state/new-staking/context';
const dateFormat = require("dateformat");

const useStyles = getStyles(style)

export default function SupplyNew() {
  const [ input, setInput ] = useState(null)
  const { useStakingPool } = useNewStakingState();

  const theme =  useTheme()
  const mode = theme.palette.primary.main === '#ffffff' ? 'light' : 'dark'

  let { state, native, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()
  let ticker = asset.toUpperCase()
  const {
    pool,
    helper,
    category
  } = useStakingPool(ticker);

  useEffect(() => {
    async function update() {
      helper.updatePromise = helper.update();
      helper.lastUpdate = Math.floor(+new Date() / 1000);
      await helper.updatePromise;
    }
    if (pool && helper) update();
  }, [])

  const approve = async() => {
    let { web3, account } = state

    try {
      let rewardsAddress = helper.meta.id
      let stakingToken = pool.token
      let contract = getERC20(web3.injected, stakingToken)
      let value = BigNumber.from(2).pow(128).toHexString();
      await contract.methods.approve(rewardsAddress, value)
      .send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            await helper.updatePool();
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
      let rewardsAddress = helper.meta.id;
      let contract = toContract(web3.injected, MultiTokenStaking, rewardsAddress)
      let amount = toTokenAmount(input, 18)

      await contract.methods.deposit(pool.id, toHex(amount), account).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0) {
          if(receipt.status === 1) {
            await dispatch(TX_CONFIRMED(receipt.transactionHash))
            await setInput(null)
            await helper.update();
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
      let rewardsAddress = helper.meta.id;
      let contract = toContract(web3.injected, MultiTokenStaking, rewardsAddress)

      await contract.methods.harvest(pool.id, account).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            await helper.update();
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
      let rewardsAddress = helper.meta.id;
      let contract = toContract(web3.injected, MultiTokenStaking, rewardsAddress)
      await contract.methods.withdrawAndHarvest(
        pool.id, toHex(pool.userStakedBalance), account
      ).send({ from: account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(receipt.status === 1) {
            await helper.updatePool();
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

    if (!pool) {
      setInput(event.target.value)
      return;
    }
    const totalSupply = pool?.totalStaked || toBN(0);
    const supply = parseFloat(formatBalance(totalSupply, 18, 10));
    let weight;
    if (totalSupply.eq(0)) {
      weight = 1;
    } else {
      const newSupply = supply + raw;
      weight = raw / newSupply;
    }
    const rewardsPerDay = pool?.rewardsPerDay || toBN(0)
    let estimatedReward = parseFloat(formatBalance(rewardsPerDay.times(weight), 18, 10));

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
    const userEarnedRewards = pool?.userEarnedRewards || toBN(0)
    const userStakedBalance = pool?.userStakedBalance || toBN(0) 
    const totalSupply = pool?.totalStaked || toBN(0)

    const dailySupply = pool?.rewardsPerDay || toBN(0)

    const relativeWeight = userStakedBalance.div(totalSupply);
    const expectedReturns = dailySupply.times(relativeWeight);
    const earnedDisplay = parseFloat(formatBalance(userEarnedRewards, 18, 6));
    const rateDisplay = formatBalance(expectedReturns, 18, 2);
    const stakedDisplay = formatBalance(userStakedBalance, 18, 6);

    return (
      <Canvas native={native} style={{ overflowX: 'hidden', margin }}  title={native ? 'REWARDS' : 'USER REWARDS'}>
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
              disabled={userEarnedRewards.eq(0)}
              onClick={claimReward}
              variant='outlined'
              margin={buttonPos}
            >
              CLAIM
            </ButtonPrimary>
            <ButtonPrimary
              disabled={userStakedBalance.eq(0)}
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
    let disableInput = !pool;

    if (disableInput) {
      return <Input label="AMOUNT" variant='outlined'
        onChange={handleInput}
        value={input}
        disabled={true}
        style={{ width: inputWidth }}
        InputProps={{ inputComponent: NumberFormat }}
      />
    }
    const userBalanceStakingToken = pool?.userBalanceStakingToken || toBN(0)
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
    const userBalanceStakingToken = pool?.userBalanceStakingToken
    const userAllowanceStakingToken = pool?.userAllowanceStakingToken
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

  function DisplayMetadata() {
    const rewardsPerDay = pool?.rewardsPerDay || toBN(0);
    const symbol = pool?.symbol || '';
    const stakingToken = pool?.token || '';
    const isPairToken = pool?.isPairToken || false;
    const totalStaked = pool?.totalStaked || toBN(0)
    let rate = 0, staked = 0;

    function StakingTokenLink() {
      if (!pool) {
        return <></>
      }
      if (isPairToken) {
        return <a
          href={`https://info.uniswap.org/pair/${stakingToken}`}
          target='_blank'
          rel='noreferrer noopener'
        >
          {symbol}
        </a>
      }
      return <Link to={`/index/${pool?.symbol}`}>{symbol}</Link>
    }

    if (pool) {
      rate = parseFloat(formatBalance(rewardsPerDay, 18, 2));
      staked = parseFloat(formatBalance(totalStaked, 18, 2));
    }
    const poolAddress = helper?.meta?.id || '';

    return (
      <ul className={classes.stats}>
        <li>
          REWARDS POOL: <span>
            {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
            <EtherScanLink network={process.env.REACT_APP_ETH_NETWORK} type='account' entity={poolAddress} />
          </span>
        </li>
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
            <li> STAKING TOKEN: <span>
                <StakingTokenLink />
              </span>
            </li>
          </Fragment>
        }
      </ul>
    )
  }

  function DisplayImages() {
    // const stakingToken = pool?.token || '';
    const isPairToken = pool?.isPairToken || false;
    return <div>
      { category && <img alt={`asset-2`} src={categoryMetadata[category]?.normal[mode]} style={imgStyles[2]} /> }
      { isPairToken && <img alt={`asset-3`} src={tokenMetadata['ETH'].image} style={imgStyles[3]} /> }
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
                <DisplayImages />
              </Grid>
              <Grid item>
                { FormInput() }
              </Grid>
            </Grid>
            {pool && (
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

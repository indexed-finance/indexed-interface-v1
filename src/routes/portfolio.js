import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import { useHistory, Link } from "react-router-dom";
import { BigNumber, formatBalance, toBN } from '@indexed-finance/indexed.js'
import { useTheme } from '@material-ui/core/styles'
import Ndx from '../assets/constants/abi/Ndx.json'
import StakingRewards from "../assets/constants/abi/IStakingRewards.json"
import ButtonPrimary from '../components/buttons/primary'
import ButtonSecondary from '../components/buttons/secondary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Canvas from '../components/canvas'
import LineProgress from '../components/lineprogress'
import Delta from '../components/utils/delta'
import { getETHPrice } from '../api/gql';
import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { isAddress } from '../assets/constants/functions'
import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import {NDX, ZERO_ADDRESS} from '../assets/constants/addresses'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'
import { getPair } from '../lib/markets'
import style from '../assets/css/routes/portfolio'
import getStyles from '../assets/css'
import { useStakingState} from "../state/staking/context";
import UniV2PairABI from '@uniswap/v2-periphery/build/IUniswapV2Pair.json';


const ListWrapper = styled(List)({
  flex: '1 1 auto',
  overflowY: 'scroll'
})

const Item = styled(ListItem)({
  borderBottom: '2px solid #666666',
  height: 75,
  '& label': {
    fontSize: 17.5
  }
})

const SecondaryAction = styled(ListItemSecondaryAction)({
  '& label': {
    color: '#999999'
  }
})

const useStyles = getStyles(style)

export default function Portfolio(){
  const [ pools, setPools ] = useState([])
  const [totalValue, setTotalValue] = useState(toBN(0))
  const [totalRewards, setTotalRewards] = useState(toBN(0))
  const [ndxbalance, setndxbalance] = useState('0')
  const [univ2prices, setuniv2prices] = useState([])
  const [staking, setstaking] = useState()

  const history = useHistory()
  const classes = useStyles()
  const theme = useTheme()
  const { useStakingPool } = useStakingState();

  let { dispatch, state } = useContext(store)

  const gov5pool = useStakingPool('GOV5')
  const univ2gov5 = useStakingPool('UNIV2:ETH-GOV5')
  const dfi5pool = useStakingPool('DFI5')
  const dfi5unipool = useStakingPool('UNIV2:ETH-GOV5')

  const [poolarray, setpoolarray] = useState([])


  useEffect(() => {
    console.log('getting stakign state')
    console.log(poolarray)

    if (gov5pool.pool && poolarray.length === 0)
    {
      let temp_array = []
      temp_array.push(gov5pool)
      temp_array.push(univ2gov5)
      temp_array.push(dfi5pool)
      temp_array.push(dfi5unipool)

      console.log('setting pool array')
      console.log(temp_array)

      setpoolarray(temp_array)
    }

  }, [gov5pool, univ2gov5, dfi5pool, dfi5unipool])

  useEffect(() => {

    async function setinidices(indices)
    {

      if(state.request && state.account  && state.indexes !== {} && state.helper && state.helper.initialized[0] && state.helper.initialized[0].userPoolBalance){
        for(let x = 0; x < indices.length; x++){
          let pool = indices[x][1]
          let lp = pool

          console.log(state)

          if (state.helper && state.helper.initialized)
          {
            for(let y = 0; y < state.helper.initialized.length; y++){
              if (state.helper.initialized[y].pool.address === pool.address)
              {
                console.log('pushing')
                pool.poolHelper.userPoolBalance = state.helper.initialized[y].userPoolBalance
              }
            }
          }

        console.log(pool)

          availableAssets.push(pool)
          availableAssets.push({
            ...lp,
            symbol: `UNIV2-ETH-${lp.symbol}`
          })
        }
        setPools(availableAssets)
      }

    }

    let availableAssets = []
    let indicescalc = Object.entries(state.indexes)

    setinidices(indicescalc)


  }, [ state.request, state.indexes, state.account ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [])

  // effect hook for calculating the  totals
  useEffect(() => {

    // helper for getting the univ2 prices
    async function getETH(unipairaddress){
      let { web3, account } = state
      const quoteEthUSD = await getETHPrice();

      if(web3.injected) {

        const contract = toContract(web3.injected, UniV2PairABI.abi, unipairaddress)

        try {
          let supply = await contract.methods.totalSupply().call()
          let supplybn = new toBN(supply)

          let reserves = await contract.methods.getReserves().call()
          let reservebn = toBN(reserves.reserve1)

          let univ2price = (reservebn * quoteEthUSD * 2) / supplybn;
          return univ2price;
        }
        catch (e)
        {
          return 0
        }
      }

      return 0;
    }

    // calculate the total values
    async function calculateTotals()
    {
      let totalValueTemp = 0;
      let totalRewardsTemp = new BigNumber(0);
      let tempPrice = 0;
      let tempUserBalance = new BigNumber(0);
      let tempRewards = new BigNumber(0);
      let temp_array = [];
      let bigzero = new BigNumber(0);
      let stakingbalancenumber = new BigNumber(0);

      console.log('my stake')

      if (state.account && poolarray && poolarray.length !== 0)
      {
        for(let x = 0; x < pools.length; x++){
          let pool = pools[x]
          tempPrice = pool && pool.price
          tempUserBalance = pool.poolHelper && pool.poolHelper.userPoolBalance ? pool.poolHelper.userPoolBalance : bigzero

          if (pool.symbol.includes('UNI'))
          {
            tempUserBalance = toBN(0)
          }

          console.log(poolarray)
          console.log(pool.symbol)
          for (let i = 0; i < poolarray.length; i++)
          {
            if (poolarray[i].pool.pool.indexPool === pool.address)
            {
              // Get price of the uni vs pair for calculating total
              if (pool.symbol.includes('UNI') && poolarray[i].pool.pool.isWethPair)
              {
                tempPrice = await getETH(poolarray[i].pool.stakingToken)
                let temp_price_obj = {symbol: pool.symbol, price: tempPrice}
                temp_array.push(temp_price_obj)
                tempUserBalance = poolarray[i].pool.userBalanceStakingToken ? poolarray[i].pool.userBalanceStakingToken : bigzero
                tempRewards = poolarray[i].pool.userEarnedRewards ? poolarray[i].pool.userEarnedRewards : bigzero
                stakingbalancenumber = poolarray[i].pool.userBalanceRewards ? poolarray[i].pool.userBalanceRewards : bigzero;
              }
              if (!pool.symbol.includes('UNI') && !poolarray[i].pool.pool.isWethPair)
              {
                tempRewards = poolarray[i].pool.userEarnedRewards ? poolarray[i].pool.userEarnedRewards : bigzero
                stakingbalancenumber = poolarray[i].pool.userBalanceRewards ? poolarray[i].pool.userBalanceRewards : bigzero;
              }
            }
          }

          console.log(tempPrice)
          console.log(tempUserBalance)
          console.log(stakingbalancenumber)
          totalValueTemp += tempPrice * (tempUserBalance.plus(stakingbalancenumber))
          console.log(tempRewards)
          totalRewardsTemp = totalRewardsTemp.plus(tempRewards)
        }

        setTotalValue(totalValueTemp)
        setTotalRewards(totalRewardsTemp)
        setuniv2prices(temp_array)
      }
      else
      {
        setTotalValue(toBN(0))
        setTotalRewards(toBN(0))
        setndxbalance('0')
        setuniv2prices([])
      }
    }

    calculateTotals();

  }, [state.account, pools, poolarray])

  const getAccountMetadata = async() => {
    let { web3, account } = state

    if(web3.injected) {
      let contract = toContract(web3.injected, Ndx.abi, NDX)
      let balance = await contract.methods.balanceOf(account).call()
      let amount = (parseFloat(balance)/Math.pow(10, 18))
          .toLocaleString({ minimumFractionDigits: 2 })

      setndxbalance(amount)
    }
  }

  useEffect(() => {
    getAccountMetadata()
  }, [ state.web3.injected ])

  async function callClaim(pool)
  {
    let { web3, account } = state

    if(web3.injected) {

      try {
        let contract = toContract(web3.injected, StakingRewards, pool)

        await contract.methods.getReward(
        ).send({ from: account })
            .on('transactionHash', (transactionHash) =>
                dispatch(TX_PENDING(transactionHash))
            ).on('confirmation', (conf, receipt) => {
              if(conf === 0){
                if(parseInt(receipt.status) == 1) {
                  dispatch(TX_CONFIRMED(receipt.transactionHash))
                } else {
                  dispatch(TX_REVERTED(receipt.transactionHash))
                }
              }
            })
      } catch(e){}

    }

  }

  let { margin, width, wallet, tableHeight } = style.getFormatting({ native: state.native })
  let mode = theme.palette.primary.main !== '#ffffff' ? 'light' : 'dark'

  // insert claim button later on again
  //<ButtonPrimary variant='outlined' margin={{ margin: 0, marginTop: -37.5 }}>
  //  CLAIM
  //</ButtonPrimary>

  function DisplayDetails(value, index)
  {
    let image = categoryMetadata[value.category].circular[mode]
    let isLPToken = value.symbol.includes('UNI')
    let lpImage = tokenMetadata['UNI'].image
    let { marginBottom, paddingTop } = {
      marginBottom: isLPToken ? 10 : 0,
      paddingtop: isLPToken ? 10 : 5
    }

    // define the display variables

    // get the pool balance from the poolhelper check for staking pool later
    let bigzero = new BigNumber(0);
    let userpoolbalance = value.poolHelper.userPoolBalance ? formatBalance(value.poolHelper.userPoolBalance, 18, 4) : '0.00';
    let tokenprice = value.price;
    let stakingpooladdress;
    let univ2balance = new BigNumber(0);
    let stakingbalancenumber = 0;

    // set user balance to 0 initially for univ2 tokens
    if (value.symbol.includes('UNI'))
    {
      userpoolbalance = '0.00';
      tokenprice = 0;
    }

    let stakingbalance = '0.00';
    let rewards = '0.00';

    // look for the corresponding staking pool
    for (let i = 0; i < poolarray.length; i++)
    {
      // check if we find a match of index pool and staking pool
      if (poolarray[i].pool.pool.indexPool === value.address)
      {

        // check the uni v2 pairing if available - otherwise we have the user balance of the original token from before
        if (value.symbol.includes('UNI') && poolarray[i].pool.pool.isWethPair)
        {
          userpoolbalance = poolarray[i].pool.userBalanceStakingToken ? formatBalance(poolarray[i].pool.userBalanceStakingToken, 18, 4) : '0.00';
          univ2balance = poolarray[i].pool.userBalanceStakingToken ? poolarray[i].pool.userBalanceStakingToken : bigzero;

          for (let j = 0; j < univ2prices.length; j++)
          {
            if (value.symbol === univ2prices[j].symbol)
            {
              tokenprice = univ2prices[j].price
            }
          }

          rewards = poolarray[i].pool.userEarnedRewards ? formatBalance(poolarray[i].pool.userEarnedRewards, 18, 4) : '0.00';
          stakingbalance = poolarray[i].pool.userBalanceRewards ? formatBalance(poolarray[i].pool.userBalanceRewards, 18, 4) : '0.00';
          stakingbalancenumber = poolarray[i].pool.userBalanceRewards ? poolarray[i].pool.userBalanceRewards : bigzero;
          stakingpooladdress = poolarray[i].pool.address;
        }

        // check the uni v2 pairing if available - otherwise we have the user balance of the original token from before
        if (!value.symbol.includes('UNI') && !poolarray[i].pool.pool.isWethPair)
        {
          stakingpooladdress = poolarray[i].pool.address;
          rewards = poolarray[i].pool.userEarnedRewards ? formatBalance(poolarray[i].pool.userEarnedRewards, 18, 4) : '0.00';
          stakingbalance = poolarray[i].pool.userBalanceRewards ? formatBalance(poolarray[i].pool.userBalanceRewards, 18, 4) : '0.00';
          stakingbalancenumber = poolarray[i].pool.userBalanceRewards ? poolarray[i].pool.userBalanceRewards : bigzero;
        }
      }
    }

    let tokenvalue = (value.poolHelper.userPoolBalance && value.poolHelper.userPoolBalance.plus(stakingbalancenumber)) ? formatBalance(toBN((value.poolHelper.userPoolBalance.plus(stakingbalancenumber)) *(tokenprice)), 18, 4) : '0';

    // calculate portion of total token of token balance
    let pooltokenweight = 0;
    if (value.poolHelper.userPoolBalance && totalValue > 0 && !value.symbol.includes('UNI'))
    {
      pooltokenweight = (value.poolHelper.userPoolBalance.plus(stakingbalancenumber)) * tokenprice / totalValue;
    }
    if (value.poolHelper.userPoolBalance && totalValue > 0 && value.symbol.includes('UNI'))
    {
      pooltokenweight = (univ2balance.plus(stakingbalancenumber)) * tokenprice / totalValue;
      tokenvalue = formatBalance(toBN((univ2balance.plus(stakingbalancenumber)) *(tokenprice)), 18, 4);
    }

    return (
        <Item key={index + 1} button>
          <ListItemText className={classes.item} primary={<>
            <div className={classes.box}>
              <img src={image} className={classes.logo} style={{ marginBottom }} />
              {isLPToken && (
                  <span style={{ marginLeft: -7.5 }}>
                              <img src={lpImage} className={classes.logo} />
                            </span>
              )}
            </div>
            <div className={classes.symbol} style={{ paddingTop }}>
              <label> {value.symbol} </label>
            </div>
          </>}
          />
          <ListItemText
              className={classes.holdings}
              primary={<span>
                        BALANCE: {userpoolbalance}
                      </span>}
              secondary={<span>
                        STAKING: {stakingbalance}
                      </span>}
          />
          <ListItemText
              className={classes.weight}
              primary={<>
                <LineProgress
                    width={150} color='#00e79a'
                    values={{
                      value: pooltokenweight
                    }}
                />
                <span className={classes.usd} >
                          ${tokenvalue}
                        </span>
              </>}
          />

          <ListItemText
              primary={
                <span style={{ float: 'left', width: '120px'}}>
                          {rewards} NDX
                        </span>
              }
          />
          <SecondaryAction>
            <ButtonPrimary  variant='outlined' margin={{ margin: 0 }} onClick={() => { callClaim(stakingpooladdress) }}>
              CLAIM
            </ButtonPrimary>
          </SecondaryAction>
        </Item>
    )
  }


  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Canvas native={state.native}>
              <div className={classes.wallet} style={{ height: wallet }}>
                <p> PORTFOLIO VALUE </p>
                <h1> ${formatBalance(toBN(totalValue), 18, 4)}</h1>
              </div>
            </Canvas>
          </Grid>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Canvas native={state.native}>
              <div className={classes.account} style={{ height: wallet }}>
                <p> REWARDS </p>
                <h1> {formatBalance(toBN(totalRewards), 18, 4)} NDX </h1>



                <p> BALANCE: {ndxbalance} NDX </p>
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 0em 0em 0em" title='PORTFOLIO' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {
                state.account && pools && pools.map((value, index) => {
                console.log('going in')
                return DisplayDetails(value, index)
              })}
            </ListWrapper>
           </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

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
import {useStaking} from "../state/staking/hooks";
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
  const history = useHistory()
  const classes = useStyles()
  const theme = useTheme()
  const staking = useStaking()

  let { dispatch, state } = useContext(store)

  useEffect(() => {
    let availableAssets = []
    let indices = Object.entries(state.indexes)

    if(state.request && state.account && pools.length == 0){
      for(let x = 0; x < indices.length; x++){
        let pool = indices[x][1]
        let lp = pool

        availableAssets.push(pool)
        availableAssets.push({
          ...lp,
          symbol: `UNIV2-ETH-${lp.symbol}`
        })
      }
      setPools(availableAssets)
    }
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
      let tempUserBalance = 0;
      let tempRewards = new BigNumber(0);

      console.log('state')
      console.log(state)
      console.log(pools)

      if (state.account)
      {
        for(let x = 0; x < pools.length; x++){
          let pool = pools[x]
          tempPrice = pool && pool.price
          tempUserBalance = pool.poolHelper && pool.poolHelper.userPoolBalance ? pool.poolHelper.userPoolBalance : toBN(0)

          if (pool.symbol.includes('UNI'))
          {
            tempUserBalance = toBN(0)
          }

          for (let i = 0; i < staking.pools.length; i++)
          {
            if (staking.pools[i].pool.indexPool === pool.address)
            {
              tempRewards = staking.pools[i].userEarnedRewards ? staking.pools[i].userEarnedRewards : toBN(0)

              // Get price of the uni vs pair for calculating total
              if (pool.symbol.includes('UNI') && staking.pools[i].pool.isWethPair)
              {
                tempPrice = await getETH(staking.pools[i].stakingToken)
                tempUserBalance = staking.pools[i].userBalanceStakingToken ? staking.pools[i].userBalanceStakingToken : toBN(0)
              }
            }
          }

          totalValueTemp += tempPrice * tempUserBalance
          totalRewardsTemp = tempRewards
        }

        setTotalValue(totalValueTemp)
        setTotalRewards(totalRewardsTemp)
      }
      else
      {
        setTotalValue(toBN(0))
        setTotalRewards(toBN(0))
        setndxbalance('0')
      }
    }

    calculateTotals();

  }, [state.account, pools])

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
    console.log('clicked')
    console.log(pool)

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
                <ButtonPrimary variant='outlined' margin={{ margin: 0, marginTop: -37.5 }}>
                  CLAIM
                </ButtonPrimary>
                <p> BALANCE: {ndxbalance} NDX </p>
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 0em 0em 0em" title='PORTFOLIO' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {pools && pools.map((value, index) => {
                let image = categoryMetadata[value.category].circular[mode]
                let isLPToken = value.symbol.includes('UNI')
                let lpImage = tokenMetadata['UNI'].image
                let { marginBottom, paddingTop } = {
                  marginBottom: isLPToken ? 10 : 0,
                  paddingtop: isLPToken ? 10 : 5
                }

                // define the display variables

                // get the pool balance from the poolhelper check for staking pool later
                let userpoolbalance = value.poolHelper.userPoolBalance ? formatBalance(value.poolHelper.userPoolBalance, 18, 4) : '0.00';
                let tokenprice = value.price;
                let stakingpooladdress;

                // set user balance to 0 initially for univ2 tokens
                if (value.symbol.includes('UNI'))
                {
                  userpoolbalance = '0.00';
                  tokenprice = 0;
                }

                let stakingbalance = '0.00';
                let rewards = '0.00';

                console.log(staking)

                // look for the corresponding staking pool
                for (let i = 0; i < staking.pools.length; i++)
                {
                  // check if we find a match of index pool and staking pool
                  if (staking.pools[i].pool.indexPool === value.address)
                  {

                    // check the uni v2 pairing if available - otherwise we have the user balance of the original token from before
                    if (value.symbol.includes('UNI') && staking.pools[i].pool.isWethPair)
                    {
                      userpoolbalance = staking.pools[i].userBalanceStakingToken ? formatBalance(staking.pools[i].userBalanceStakingToken, 18, 4) : '0.00';

                      //TODO update with real price
                      tokenprice = 0

                      rewards = staking.pools[i].userEarnedRewards ? formatBalance(staking.pools[i].userEarnedRewards, 18, 4) : '0.00';
                      stakingbalance = staking.pools[i].userBalanceRewards ? formatBalance(staking.pools[i].userBalanceRewards, 18, 4) : '0.00';
                      stakingpooladdress = staking.pools[i].pool.address;
                    }

                    // check the uni v2 pairing if available - otherwise we have the user balance of the original token from before
                    if (!value.symbol.includes('UNI') && !staking.pools[i].pool.isWethPair)
                    {
                      stakingpooladdress = staking.pools[i].pool.address;
                      rewards = staking.pools[i].userEarnedRewards ? formatBalance(staking.pools[i].userEarnedRewards, 18, 4) : '0.00';
                      stakingbalance = staking.pools[i].userBalanceRewards ? formatBalance(staking.pools[i].userBalanceRewards, 18, 4) : '0.00';
                    }
                  }
                }

                let tokenvalue = value.poolHelper.userPoolBalance ? formatBalance(toBN(value.poolHelper.userPoolBalance *(tokenprice)), 18, 4) : '0';

                // calculate portion of total token of token balance
                let pooltokenweight = 0;
                if (value.poolHelper.userPoolBalance && totalValue > 0)
                {
                  pooltokenweight = value.poolHelper.userPoolBalance * tokenprice / totalValue;
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
                        <span className={classes.usd}>
                          ${tokenvalue}
                        </span>
                     </>}
                    />

                    <ListItemText
                      primary={
                        <span style={{ float: 'left'}}>
                          {rewards} NDX
                        </span>
                      }
                    />
                    <SecondaryAction>
                      <ButtonPrimary variant='outlined' margin={{ margin: 0 }} onClick={() => { callClaim(stakingpooladdress) }}>
                        CLAIM
                      </ButtonPrimary>
                    </SecondaryAction>
                  </Item>
                )
              })}
            </ListWrapper>
           </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

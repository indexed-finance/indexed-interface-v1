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
import ButtonPrimary from '../components/buttons/primary'
import ButtonSecondary from '../components/buttons/secondary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Canvas from '../components/canvas'
import LineProgress from '../components/lineprogress'
import Delta from '../components/utils/delta'

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { isAddress } from '../assets/constants/functions'
import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import { NDX, ZERO_ADDRESS } from '../assets/constants/addresses'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'

import style from '../assets/css/routes/portfolio'
import getStyles from '../assets/css'
import {useStaking} from "../state/staking/hooks";

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
  const [ndxbalance, setndxbalance] = useState(0)
  const history = useHistory()
  const classes = useStyles()
  const theme = useTheme()
  const staking = useStaking()

  let { dispatch, state } = useContext(store)

  useEffect(() => {
    let availableAssets = []
    let indices = Object.entries(state.indexes)

    if(state.request && pools.length == 0){
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
  }, [ state.request, state.indexes ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [])

  // effect hook for calculating the  totals
  useEffect(() => {
    let totalValueTemp = 0;
    let totalRewardsTemp = 0;
    let tempPrice = 0;
    let tempUserBalance = 0;
    let tempRewards = 0;

    if (state.account)
    {
      for(let x = 0; x < pools.length; x++){
        let pool = pools[x]
        tempPrice = pool && pool.price

        for (let i = 0; i < staking.pools.length; i++)
        {
          if (staking.pools[i].pool.indexPool === pool.address)
          {
            tempRewards = staking.pools[i].pool.userEarnedRewards ? staking.pools[i].pool.userEarnedRewards : toBN(0);
          }
        }

        tempUserBalance = pool.poolHelper && pool.poolHelper.userPoolBalance ? pool.poolHelper.userPoolBalance : toBN(0)
        totalValueTemp += tempPrice * tempUserBalance

        totalRewardsTemp = tempRewards * tempUserBalance
      }
      setTotalValue(totalValueTemp)
      setTotalRewards(totalRewardsTemp)
      setndxbalance(state.balances['NDX'])
    }
    else
    {
      setTotalValue(toBN(0))
      setTotalRewards(toBN(0))
      setndxbalance(0)
    }

  }, [state.account, pools])

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
                let userpoolbalance = value.poolHelper.userPoolBalance ? formatBalance(value.poolHelper.userPoolBalance, 18, 4) : '0';
                let tokenprice = value.price;
                let tokenvalue = value.poolHelper.userPoolBalance ? formatBalance(toBN(value.poolHelper.userPoolBalance *(value.price)), 18, 4) : '0';

                let stakingbalance = '0';
                let rewards = '0';


                // look for the corresponding staking pool
                for (let i = 0; i < staking.pools.length; i++)
                {
                  if (staking.pools[i].pool.indexPool === value.address)
                  {
                    rewards = staking.pools[i].pool.userEarnedRewards ? formatBalance(staking.pools[i].pool.userEarnedRewards, 18, 4) : '0';
                    stakingbalance = staking.pools[i].pool.userBalanceRewards ? formatBalance(staking.pools[i].pool.userBalanceRewards, 18, 4) : '0';
                  }
                }

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
                      <ButtonPrimary variant='outlined' margin={{ margin: 0 }}>
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

import React, { Fragment, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import { Redirect } from 'react-router-dom'
import { useTheme } from '@material-ui/core/styles'
import StakingRewards from "../assets/constants/abi/IStakingRewards.json"
import ButtonPrimary from '../components/buttons/primary'

import Container from '../components/container'
import Canvas from '../components/canvas'
import LineProgress from '../components/lineprogress'
import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../assets/constants/parameters'
import { categoryMetadata, tokenMetadata } from '../assets/constants/parameters'
import { toContract } from '../lib/util/contracts'
import { store } from '../state'
import style from '../assets/css/routes/portfolio'
import getStyles from '../assets/css'

import { usePortfolioValue, useUserRewards } from "../hooks/useRewards";
import { useWeb3 } from "../hooks/useWeb3";

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
  const classes = useStyles()
  const theme = useTheme()
  const { loggedIn } = useWeb3();

  let { dispatch, state } = useContext(store)

  const rewardsData = useUserRewards();
  const { ndxBalance, earned, total, ndxValue } = rewardsData || {};
  const { totalValue, tokens } = usePortfolioValue()

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

  if (!loggedIn) {
    return <Redirect to='/' />
  }

  function DisplayDetails(token, index) {
    const {
      symbol,
      balance,
      staked,
      value,
      earned,
      category,
      stakingPoolAddress
    } = token;
    let image = categoryMetadata[category].circular[mode]
    let isLPToken = symbol.includes('UNI')
    let lpImage = tokenMetadata['UNI'].image
    let { marginBottom, paddingTop } = {
      marginBottom: isLPToken ? 10 : 0,
      paddingtop: isLPToken ? 10 : 5
    }

    return (
        <Item key={index + 1}>
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
              <label> {symbol} </label>
            </div>
          </>}
          />
          <ListItemText
              className={classes.holdings}
              primary={<span>
                BALANCE: {balance}
              </span>}
              secondary={<span>
                STAKING: {staked}
              </span>}
          />
          <ListItemText
            className={classes.weight}
            primary={<>
              <LineProgress
                width={150} color='#00e79a'
                values={{
                  value: value / totalValue
                }}
              />
              <span className={classes.usd} >
                ${value}
              </span>
            </>}
          />

          <ListItemText
            primary={
              <span style={{ float: 'left', width: '150px'}}>
                {earned ? `${earned} NDX` : ''}
              </span>
            }
          />
          <SecondaryAction>
            {
              earned > 0 && <ButtonPrimary  variant='outlined' margin={{ margin: 0 }} onClick={() => { callClaim(stakingPoolAddress) }}>
                CLAIM
              </ButtonPrimary>
            }
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
                <h1> ${(totalValue || 0) + (ndxValue || 0)} </h1>
              </div>
            </Canvas>
          </Grid>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Canvas native={state.native}>
              <div className={classes.account} style={{ height: wallet }}>
                <p> NDX </p>
                <h2> TOTAL: { total } NDX (${ndxValue}) </h2>
                <p> BALANCE: {ndxBalance} NDX </p>
                <p> EARNED: {earned} NDX </p>
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12} className={classes.root}>
          <Container margin={margin} padding="1em 0em 0em 0em" title='PORTFOLIO' >
           <div className={classes.proposals} style={{ height: tableHeight }}>
            <ListWrapper dense style={{ width }}>
              {
                tokens && tokens.map((token, index) => {
                return DisplayDetails(token, index)
              })}
            </ListWrapper>
           </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

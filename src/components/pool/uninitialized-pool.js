import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Alert from '@material-ui/lab/Alert';

import ExplainCredit from './explain-credit';
import Canvas from '../canvas'
import Container from '../container'
import Spline from '../charts/spline'
import ButtonPrimary from '../buttons/primary'
import InitializerForm from './initializer-form';
import Weights from '../weights';
import { toWei } from '@indexed-finance/indexed.js'

import { InitializerStateProvider, useInitializerState } from "../../state/initializer";
import PoolInitializer from '../../assets/constants/abi/PoolInitializer.json'
import { store } from '../../state'

import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../../assets/constants/parameters'
import style from '../../assets/css/routes/pool'
import getStyles from '../../assets/css'
import { toContract } from '../../lib/util/contracts'
import copyToClipboard from '../../lib/copyToClipboard';
import Copyable from '../copyable';

const useStyles = getStyles(style);

function Target({ label, asset, i, height, r }){
  const { useToken, initState: { pool } } = useInitializerState();
  const token = useToken(i)
  const { address } = asset
  const market = pool.tokenPrices[address]
  const price = market ? parseFloat(market.toString()): 0

  return(
    <Grid item style={{ height }} className={label}>
      <div>
       <Weights native={r} asset={token} />
      </div>
      <div style={{ float: 'right',  marginTop:  !r ? '-2.25em' : '.75em'}}>
       <label> Ξ {((price * token.currentBalance)).toLocaleString()} </label>
     </div>
   </Grid>
  )
}

function UninitializedPoolPage({ address, metadata }) {
  const { initState, setHelper, displayPoolTotalCredit, displayUserCredit } = useInitializerState();
  const [ shouldUpdate, setUpdate ] = useState(false);
  let { state, dispatch } = useContext(store);
  const classes = useStyles()

  let { native, request } = state

  const findHelper = () => {
    const helper = state.helper.uninitialized.find(i => i.pool.initializer.address === address);
    return helper;
  };

  const finalisePool = async() => {
    try {
      let { web3, account } = state
      let contract = toContract(web3.injected, PoolInitializer.abi, address)

      await contract.methods.finish().send({ from: state.account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf == 0){
          if(receipt.status == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
    } catch(e) { }
  }

  useEffect(() => {
    const checkTargets = () => {
      if(initState.pool.tokens.length > 0) {
        for(let x = 0; x < initState.pool.tokens.length; x++ ) {
          let asset = initState.pool.tokens[x]
          if(!asset.amountRemaining.eq(0)) return false
        }
        return true
      } else return false
    }
    const shouldUpdate = () => {
      if(initState.pool && checkTargets()){
        setUpdate(true)
      }
    }
    shouldUpdate()
  }, [ initState ] )

  useEffect(() => {
    if (initState.pool || !state.helper) return;
    const setPool = () => {
      const helper = findHelper();
      setHelper(helper);
    };
    setPool();
  }, [state.web3.injected, state.helper]);

  if (!initState.pool) {
    return <div />
  }

  let { name, symbol } = initState.pool;

  function Overlay () {
    const background = state.dark ? 'rgba(0,0,0, .5)' : 'rgba(17, 17, 17, .5)'

    return(
      <div style={{ zIndex: 5, textAlign: 'center', background, height: '20em', width: '28.75em', position: 'absolute', clear: 'both' }}>
        <ButtonPrimary onClick={finalisePool} margin={{ margin: '7.5em 8.75em' }}> DEPLOY INDEX </ButtonPrimary>
       </div>
    )
  }

  function MetaDisplay() {
    if (!native) {
      return (
      <Fragment>
        <h2> {name} [{symbol}] </h2>
        <div style={{ marginTop: 15 } }>
          <Copyable text={address} float='right'>
            <h3>{address.substring(0, 6)}...{address.substring(38, 64)}</h3>
          </Copyable>
        </div>
      </Fragment>
      )
    }
    return (
    <Fragment>
      <h4> {name} [{symbol}] </h4>
      <div style={{ marginTop: 5} }>
        <Copyable text={address}>
          <h4>{address.substring(0, 6)}...{address.substring(38, 64)}</h4>
        </Copyable>
      </div>
    </Fragment>
    )
  }

  let {
    marginX, margin, width, padding, chartHeight, fontSize, percent, targetHeight, paddingRight
  } = style.getFormatting({ native, request, active: false });

  return (
    <Grid container direction='column' alignItems='flex-start' justify='stretch'>
      <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%'}}>
        <ParentSize>
          {({ width, height }) => (
            <Canvas native={native} style={{ width: !state.native ? width : 'auto', margin }} custom={percent}>
            <div className={classes.market}>
              <MetaDisplay />
            </div>
            <div className={classes.chart}>
              <Spline absolute={false} ready={true} padding={padding} native={native} color='#ffa500' metadata={metadata} height={chartHeight} />
            </div>
            <div className={classes.stats} style={{ fontSize }}>
              <ul>
                <Fragment>
                  <li style={{ paddingRight }}><ExplainCredit /></li>
                  <li style={{ paddingRight }}> TOTAL CREDIT: Ξ {displayPoolTotalCredit} </li>
                  <li style={{ paddingRight }}> YOUR CREDIT: Ξ {displayUserCredit} </li>
                </Fragment>
              </ul>
            </div>
          </Canvas>
        )}
        </ParentSize>
        </Grid>
        <Grid item xs={12} md={5} lg={5} xl={5}>
          <Container margin={margin} padding="1em 0em" title='ASSETS'>
            <div className={classes.alert}>
              <Alert variant="outlined" severity={shouldUpdate ? 'info' : 'warning'} style={{  borderWidth: 2 }}>
                {shouldUpdate ? 'THIS POOL IS READY FOR DEPLOYMENT' : 'THIS POOL IS UNINITIALIZED'}
              </Alert>
              </div>
            <div className={classes.container}>
              {shouldUpdate && (<Overlay />)}
              <InitializerForm metadata={{ address, symbol: metadata.symbol }} classes={classes} />
            </div>
          </Container>
        </Grid>
      </Grid>
      <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%' }}>
        <ParentSize>
          {({ width }) => (
            <Container margin={marginX} padding="1em 0em" title="TARGETS">
              <Grid container direction='row' alignItems='flex-start' justify='space-evenly'>
                <div className={classes.targets} style={{ width: !state.native ? width : 'auto' }}>
                  {initState.tokens.map((v, i) => {
                    let label = 'item';

                    if(i === 0) label = 'first';
                    else if(i === (initState.tokens.length - 1)) label = 'last';

                    return <Target r={state.native} height={targetHeight} label={label} i={i} asset={v} />
                  })}
                </div>
              </Grid>
            </Container>
          )}
        </ParentSize>
      </Grid>
    </Grid>
  )
}


export default function UninitializedPool(props) {
  return(
    <InitializerStateProvider>
      <UninitializedPoolPage {...props} />
    </InitializerStateProvider>
  )
}

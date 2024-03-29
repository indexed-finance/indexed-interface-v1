import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Alert from '@material-ui/lab/Alert';

import ExplainCredit from './explain-credit';
import Canvas from '../canvas'
import Container from '../container'
import Spline from '../charts/spline'
import InitializerForm from './initializer-form';
import Weights from '../weights';

import { InitializerStateProvider, useInitializerState } from "../../state/initializer";
import { store } from '../../state'

import style from '../../assets/css/routes/pool'
import getStyles from '../../assets/css'
import Copyable from '../utils/copyable';

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
       <Weights width='auto' native={r} asset={token} />
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
  let { state } = useContext(store);
  const classes = useStyles()

  let { native, request } = state

  const findHelper = () => {
    const helper = state.helper.uninitialized.find(i => i.pool.initializer.address === address);
    return helper;
  };

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
      if(helper) setHelper(helper);
    };
    if(!initState.pool && state.helper) setPool();
  }, [state.web3.injected, state.helper]);

  if (!initState.pool) {
    return <div />
  }

  let { name, symbol } = initState.pool;

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
            <div className={classes.market} style={{ position: 'relative', padding: '0em 1.5em 1em 1.5em' }}>
              <MetaDisplay />
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
              <InitializerForm shouldUpdate={shouldUpdate} metadata={{ address, symbol: metadata.symbol }} classes={classes} />
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

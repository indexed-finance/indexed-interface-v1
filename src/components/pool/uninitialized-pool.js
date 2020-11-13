import React, { Fragment, useContext, useEffect } from 'react';
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

const useStyles = getStyles(style);

function Target({ label, asset, i }){
  const { useToken, initState: { pool } } = useInitializerState();
  const token = useToken(i)
  const { address } = asset
  const market = pool.tokenPrices[address]
  const price = market ? parseFloat(market.toString()): 0

  return(
    <Grid item style={{ width: '100%' }} className={label}>
      <div style={{ width: '75%'}}>
       <Weights asset={token} />
      </div>
      <div style={{ width: '25%', float: 'right',  marginTop: '-2.25em'}}>
       <label> Ξ {((price * token.currentBalance)).toLocaleString()} </label>
     </div>
   </Grid>
  )
}

function UninitializedPoolPage({ address, metadata }) {
  const { initState, setHelper, displayPoolTotalCredit, displayUserCredit } = useInitializerState();
  let { state } = useContext(store);
  const classes = useStyles()

  let { native, request } = state

  const findHelper = () => {
    const helper = state.helper.uninitialized.find(i => i.pool.initializer.address === address);
    return helper;
  };

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

  function MetaDisplay() {
    if (!native) {
      return <Fragment>
        <h2> {name} </h2>
        <h3> {address.substring(0, 6)}...{address.substring(38, 64)} </h3>
      </Fragment>
    }
    return <Fragment>
      <h3> {name} [{symbol}] </h3>
      <h4> {address.substring(0, 6)}...{address.substring(38, 64)} </h4>
    </Fragment>
  }

  let {
    marginX, margin, width, padding, chartHeight, fontSize
  } = style.getFormatting({ native, request, active: false });

  return (
    <Grid container direction='column' alignItems='flex-start' justify='stretch'>
      <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%'}}>
        <ParentSize>
          {({ width, height }) => (
          <Canvas native={native} style={{ width: !native ? width : 'auto' }} custom='6.75%'>
            <div className={classes.market}>
              <MetaDisplay />
            </div>
            <div className={classes.chart}>
              <Spline ready={true} padding={padding} native={native} color='#ffa500' metadata={metadata} height={chartHeight} />
            </div>
            <div className={classes.stats} style={{ fontSize }}>
              <ul>
                <Fragment>
                  <li><ExplainCredit /></li>
                  <li> TOTAL CREDIT: Ξ {displayPoolTotalCredit} </li>
                  <li> YOUR CREDIT: Ξ {displayUserCredit} </li>
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
              <Alert variant="outlined" severity="warning" style={{  borderWidth: 2 }}>
                THIS POOL IS UNINITIALIZED
              </Alert>
              </div>
            <div className={classes.container} style={{ width }}>
              <InitializerForm metadata={{ address }} classes={classes} />
            </div>
          </Container>
        </Grid>
      </Grid>
      <Grid item xs={12} md={7} lg={7} xl={7} style={{ width: '100%' }}>
        <ParentSize>
          {({ width }) => (
            <Container margin={marginX} padding="1em 0em" title="TARGETS">
              <Grid container direction='row' alignItems='flex-start' justify='space-evenly'>
                <div className={classes.targets} style={{ width }}>
                  {initState.tokens.map((v, i) => {
                    let label = 'item';

                    if(i === 0) label = 'first';
                    else if(i === (initState.tokens.length - 1)) label = 'last';

                    return <Target label={label} i={i} asset={v} />
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

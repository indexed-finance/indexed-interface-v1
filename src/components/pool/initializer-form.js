import React, { Fragment, useContext, useEffect } from 'react'


// import style from '../../assets/css/components/approvals'
// import getStyles from '../../assets/css'
import { store } from '../../state'

import TokenInputs from '../inputs/token-inputs';
import ButtonPrimary from '../buttons/primary'
import { useInitializerState } from '../../state/initializer';
import { toContract } from '../../lib/util/contracts';
import PoolInitializer from '../../assets/constants/abi/PoolInitializer.json'

import {
  TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER, UNCLAIMED_CREDITS
} from '../../assets/constants/parameters'

// const useStyles = getStyles(style)

// balance, metadata, height, width, input, param, set, change, rates
export default function InitializerForm({ metadata, classes }) {
  // const classes = useStyles()

  const { useToken, initState, setHelper, updatePool, displayTotalCredit } = useInitializerState();
  let { state, dispatch, account, handleTransaction } = useContext(store);

  const findHelper = (i) => {
    let { address } = metadata
    return i.uninitialized.find(i => i.pool.initializer.address === address);
  }

  async function contributeTokens() {
    const abi = require('../../assets/constants/abi/PoolInitializer.json').abi;
    const initializer = toContract(state.web3.injected, abi, initState.pool.address);
    const minimumCredit = initState.creditEthTotal;
    let fn;
    if (initState.isSingle) {
      let i = initState.selectedIndex;
      let token = initState.tokens[i].address;
      let amount = initState.amounts[i];
      fn = initializer.methods['contributeTokens(address,uint256,uint256)'](token, amount, minimumCredit);
    } else {
      const tokens = [];
      const amounts = [];
      initState.tokens.forEach((token, i) => {
        if (!initState.selected[i]) return;
        tokens.push(token.address);
        amounts.push(initState.amounts[i]);
      });
      fn = initializer.methods['contributeTokens(address[],uint256[],uint256)'](tokens, amounts, minimumCredit);
    }
    await handleTransaction(fn.send({ from: account }))
      .then(updatePool)
      .catch(() => {});
  }

  useEffect(() => {
    const setPool = async() => {
      let poolHelper = findHelper(state.helper)

      if(poolHelper) setHelper(poolHelper);
    }
    if (!initState.pool && state.helper) setPool();
  }, [ state.web3.injected, state.helper ])

  return (
    <Fragment>
      <TokenInputs useToken={useToken} tokens={initState.tokens} width='100%' height='calc(40vh - 75px)' />
      <div className={classes.reciept}>
        <p> CREDIT: <span id='credit'>Ξ{displayTotalCredit}</span></p>
      </div>
      <div className={classes.submit}>
        <ButtonPrimary variant='outlined' onClick={contributeTokens} style={{ marginRight: 0 }}>
          JOIN
        </ButtonPrimary>
      </div>
    </Fragment>
  )
}

import React, { Fragment, useState, useContext, useEffect } from 'react'

import style from '../../assets/css/components/form'
import { store } from '../../state'

import TokenInputs from '../inputs/token-inputs';
import ButtonPrimary from '../buttons/primary'
import { useInitializerState } from '../../state/initializer';
import { toContract } from '../../lib/util/contracts';
import PoolInitializer from '../../assets/constants/abi/PoolInitializer.json'

import { fromWei, toHex } from '@indexed-finance/indexed.js'
import { TX_CONFIRMED, TX_REVERTED, TX_PENDING } from '../../assets/constants/parameters'
import ParentSize from '@vx/responsive/lib/components/ParentSize'

import ExplainCredit from './explain-credit';

export default function InitializerForm({ shouldUpdate, component, metadata, classes }) {
  const [ output, setOutput ] = useState(0)
  const [ isInit, setInit ] = useState(false)

  const { useToken, initState, setHelper, updatePool, displayPoolTotalCredit, displayTotalCredit } = useInitializerState();
  let { dispatch, state, handleTransaction } = useContext(store);

  function Overlay ({ height, width, f }) {
    const background = state.dark ? 'rgba(0,0,0, .5)' : 'rgba(17, 17, 17, .25)'

    return(
      <div style={{ zIndex: 5, textAlign: 'center', height, background, width, position: 'absolute', clear: 'both' }}>
        <ButtonPrimary onClick={f} margin={{ margin: '25% 27.5%' }}> DEPLOY INDEX </ButtonPrimary>
      </div>
    )
  }

  const finalisePool = async() => {
      let { address } = metadata
      let { web3 } = state

      let initializer = toContract(web3.injected, PoolInitializer.abi, address)

      await initializer.methods.finish()
      .send({ from: state.account })
      .on('transactionHash', (transactionHash) =>
        dispatch(TX_PENDING(transactionHash))
      ).on('confirmation', async(conf, receipt) => {
        if(conf === 0){
          if(parseInt(receipt.status) == 1) {
            dispatch(TX_CONFIRMED(receipt.transactionHash))
          } else {
            dispatch(TX_REVERTED(receipt.transactionHash))
          }
        }
      })
  }

  const calcEstimatedTokenOutput = () => {
    let { tokens, amounts } = initState

    let totalPoolCredits = parseFloat(displayPoolTotalCredit)

    if(totalPoolCredits === 0) return totalPoolCredits

    let culmativeTargetsUSD = tokens.map((v, i) => v.priceUSD * fromWei(v.targetBalance))
    let culmativeQueryUSD = tokens.map((v, i) => v.priceUSD * fromWei(amounts[i]))
    let culmativePoolUSD = tokens.map((v, i) => v.priceUSD * fromWei(v.balance))
    let culmativeTargetsSum = culmativeTargetsUSD.reduce((a, b) => a + b)
    let culmativePoolSum = culmativePoolUSD.reduce((a, b) => a + b)
    let culmativeQuerySum = culmativeQueryUSD.reduce((a, b) => a + b)
    let culmativeQueryToTargetsRatio = culmativeQuerySum/culmativeTargetsSum
    let ratioUSDPoolToInputs = culmativePoolSum / culmativeQueryToTargetsRatio
    let estimatedTokenOutput = (displayTotalCredit/ratioUSDPoolToInputs) * 100
    let displayTokenOutput = estimatedTokenOutput > 1 ? 1 : estimatedTokenOutput

    return parseFloat(displayTokenOutput * 100).toFixed(2);
  }

  const findHelper = (i) => {
    let { address } = metadata
    return i.uninitialized.find(i => i.pool.initializer.address == address);
  }

  async function contributeTokens() {
    const abi = require('../../assets/constants/abi/PoolInitializer.json').abi;
    const initializer = toContract(state.web3.injected, abi, initState.pool.address);
    const minimumCredit = toHex(initState.creditEthTotal.times(0.98));

    let fn;
    if (initState.selectedIndex != undefined) {
      let i = initState.selectedIndex;
      let token = initState.tokens[i].address;
      let amount = toHex(initState.amounts[i]);

      fn = initializer.methods['contributeTokens(address,uint256,uint256)'](token, amount, minimumCredit);
    } else {
      const tokens = [];
      const amounts = [];
      initState.tokens.forEach((token, i) => {
        if (!initState.selected[i]) return;
        tokens.push(token.address);
        amounts.push(toHex(initState.amounts[i]));
      });
      fn = initializer.methods['contributeTokens(address[],uint256[],uint256)'](tokens, amounts, minimumCredit);
    }

    await handleTransaction(fn.send({ from: state.account }))
      .then(() => updatePool(true))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    const setPool = () => {
      let poolHelper = findHelper(state.helper)
      setHelper(poolHelper);
      setInit(true);
    }
    if (!isInit && !initState.pool && state.helper) setPool();
  }, [ state.helper, state.web3.injected  ])

  useEffect(() => {
    const verifyConnectivity = async() => {
      if((state.web3.injected || window.ethereum) && !initState.pool.userAddress) {
        await initState.pool.setUserAddress(state.account)
        await initState.pool.updateUserData()
        await updatePool()
      }
    }
    verifyConnectivity()
  }, [ state.web3.injected, isInit ])

  useEffect(() => {
    if(initState.tokens.length > 0){
      setOutput(calcEstimatedTokenOutput())
    }
  }, [ displayTotalCredit ])


  let { height } = style.getFormatting(state.native)

  return (
    <Fragment>
      {shouldUpdate && (
        <ParentSize>
          {({ width }) => (
            <Overlay f={finalisePool} height={height} width={width} />
          )}
        </ParentSize>
      )}
      <TokenInputs isInitialiser={true} useToken={useToken} tokens={initState.tokens} width='100%' height={height} />
      <div className={classes.reciept}>
        <p>  EST TOKENS: <span>{output} {metadata.symbol}</span> </p>
        <p>  <ExplainCredit /> CREDIT: <span id='credit'>Ξ {displayTotalCredit}</span> </p>
      </div>
      <div className={classes.submit}>
        <ButtonPrimary variant='outlined' onClick={contributeTokens} disabled={!initState.ready} style={{ marginRight: 0 }}>
          JOIN
        </ButtonPrimary>
      </div>
    </Fragment>
  )
}

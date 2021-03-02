import { formatBalance, getStakingHelpers, PoolHelper, StakingPoolHelper } from '@indexed-finance/indexed.js'
import { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { AddPools, SetMetadata, StakingAction } from './actions';
import { store } from '../index'

import { StakingState, stakingInitialState, stakingReducer, StakingPoolMetadata } from './reducer';
import { useEtherPrice } from '../../hooks/useRewards';
import { useUniswapPairsWithLoadingIndicator } from '../../hooks/useUniswapPairs';
import { computeUniswapPairAddress } from '@indexed-finance/indexed.js/dist/utils/address';
import { NDX, WETH } from '../../assets/constants/addresses';

const WETH_NDX_PAIR = computeUniswapPairAddress(WETH, NDX);

interface StakingPoolHook {
  pool?: StakingPoolHelper;
  metadata?: StakingPoolMetadata;
  userBalanceStakingToken?: string;
  userAllowanceStakingToken?: string;
  userStakedAmount?: string;
  userEarnedAmount?: string;
}

export function useStakingPool(state: StakingState, indexOrSymbol: number | string): StakingPoolHook {
  const pool = typeof indexOrSymbol == 'number' ? state.pools[indexOrSymbol] : state.pools.find(p => {
    const meta = state.metadata[p.pool.address];
    return meta && meta.stakingSymbol.toLowerCase() === indexOrSymbol.toLowerCase();
  })
  const metadata = pool && state.metadata[pool.pool.address];
  const data: StakingPoolHook = { pool, metadata };
  
  if (pool) {
    data.userBalanceStakingToken = pool.userBalanceStakingToken ? formatBalance(pool.userBalanceStakingToken, 18, 4) : '0';
    data.userAllowanceStakingToken = pool.userAllowanceStakingToken ? formatBalance(pool.userAllowanceStakingToken, 18, 4) : '0';
    data.userEarnedAmount = pool.userEarnedRewards ? formatBalance(pool.userEarnedRewards, 18, 6) : '0';
    data.userStakedAmount = pool.userBalanceRewards ? formatBalance(pool.userBalanceRewards, 18, 6) : '0';
  }
  return data;
}

export interface StakingContextType {
  ndxPrice: number | undefined;
  ethPrice: number | undefined;
  stakingTokenPrices: { [token: string]: number } | undefined;
  pools: StakingPoolHelper[];
  metadata: { [key: string]: StakingPoolMetadata };
  useStakingPool(indexOrSymbol: number | string): StakingPoolHook;
}

export function useStaking(): StakingContextType {
  const [state, dispatch] = useReducer(stakingReducer, stakingInitialState);
  const { state: globalState } = useContext(store);
  const pairAddresses = useMemo(() => [
    ...state.pools.filter(p => p.pool.isWethPair).map(p => p.stakingToken),
    WETH_NDX_PAIR
  ], [state.pools]);
  const [pairsData, loadingPairs] = useUniswapPairsWithLoadingIndicator(pairAddresses);
  const indexPoolHelpers: PoolHelper[] | undefined = useMemo(
    () => globalState.helper && globalState.helper.initialized,
    [globalState.helper, globalState.didLoadHelper]
  );

  const ethPrice = useEtherPrice();
  const ndxPrice = useMemo(() => {
    if (loadingPairs || !ethPrice || !pairsData || !pairsData[WETH_NDX_PAIR]) return undefined;
    const pair = pairsData[WETH_NDX_PAIR];
    if (NDX.toLowerCase() === pair.token0.toLowerCase()) {
      return pair.reserve1.div(pair.reserve0).toNumber() * ethPrice;
    }
    return pair.reserve0.div(pair.reserve1).toNumber() * ethPrice;
  }, [pairsData, loadingPairs, ethPrice])

  useEffect(() => {
    const provider = globalState.web3[process.env.REACT_APP_ETH_NETWORK];
    const loadStakingPools = async () => {
      const pools = await getStakingHelpers(provider, globalState.account);
      dispatch({ type: 'ADD_POOLS', pools });
    }
    loadStakingPools();
  }, []);

  useEffect(() => {
    const account = globalState.account;
    if (!state.pools.length || !account) return;
    const setAccount = async () => {
      for (let pool of state.pools) {
        if (pool.userAddress) return;
        pool.setUserAddress(account);
      }
    }
    setAccount();
  }, [ globalState.account, state.pools.length ])

  useEffect(() => {
    if (
      Object.keys(state.metadata).length ||
      !state.pools.length ||
      !indexPoolHelpers
    ) return;

    const setMetadata = () => {
      const actions: StakingAction[] = [];
      for (let pool of state.pools) {
        const { indexPool } = pool.pool;
        const helper = indexPoolHelpers.find(h => h.address.toLowerCase() === indexPool.toLowerCase());
        if (globalState.account && !pool.userAddress) {
          pool.setUserAddress(globalState.account)
        }
        const { name: indexPoolName, symbol: indexPoolSymbol } = helper;
        const indexPoolTokenSymbols = helper.tokens.map(t => t.symbol);
        const stakingSymbol = pool.pool.isWethPair ? `UNIV2:ETH-${indexPoolSymbol}` : indexPoolSymbol;
        actions.push({
          type: 'SET_METADATA',
          id: pool.pool.address,
          metadata: {
            indexPoolName,
            indexPoolSymbol,
            indexPoolTokenSymbols,
            stakingSymbol,
            poolCategory: helper.pool.category
          }
        });
      }
      dispatch(actions);
    }
    setMetadata();
  }, [ globalState.didLoadHelper, state.pools.length ]);

  const stakingTokenPrices: { [address: string]: number } = useMemo(
    () => {
      if (
        !ethPrice || !indexPoolHelpers || !state.pools ||
        !state.pools.length || !indexPoolHelpers.length || loadingPairs ||
        !pairsData || Object.keys(pairsData).length === 0
      ) {
        return undefined;
      }
      return state.pools.reduce((obj, pool) => {
        let price: number;
        if (pool.pool.isWethPair) {
          const pair = pairsData[pool.stakingToken];
          if (!pair) return { ...obj, [pool.stakingToken]: 0 };
          if (pair.token0.toLowerCase() === WETH.toLowerCase()) {
            price = pair.reserve0.times(2).div(pair.totalSupply).toNumber() * ethPrice;
          } else {
            price = pair.reserve1.times(2).div(pair.totalSupply).toNumber() * ethPrice;
          }
        } else {
          const { indexPool } = pool.pool;
          const helper = indexPoolHelpers.find(h => h.address.toLowerCase() === indexPool.toLowerCase());
          ({ price } = (globalState.indexes && globalState.indexes[helper.symbol]) || { price: 0 });
        }
        return {...obj, [pool.stakingToken]: price }
      }, {})
    },
    [loadingPairs, state.pools, indexPoolHelpers, globalState.indexes, pairsData, ethPrice]
  );

  return {
    pools: state.pools,
    metadata: state.metadata,
    useStakingPool: (indexOrSymbol: string | number) => useStakingPool(state, indexOrSymbol),
    ndxPrice,
    ethPrice,
    stakingTokenPrices
  }
}
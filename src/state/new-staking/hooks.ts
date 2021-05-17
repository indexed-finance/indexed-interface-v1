import { formatBalance, NewStakingHelper, PoolHelper } from '@indexed-finance/indexed.js'
import { toProvider } from '@indexed-finance/indexed.js/dist/utils/provider'
import { NewStakingPool } from '@indexed-finance/indexed.js/dist/new-staking/types'
import { useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { store } from '../index'

import { NewStakingState, newStakingInitialState, newStakingReducer } from './reducer';
import { useEtherPrice } from '../../hooks/useRewards';
import { useUniswapPairsWithLoadingIndicator } from '../../hooks/useUniswapPairs';
import { computeUniswapPairAddress } from '@indexed-finance/indexed.js/dist/utils/address';
import { NDX, WETH } from '../../assets/constants/addresses';

const WETH_NDX_PAIR = computeUniswapPairAddress(WETH, NDX);

export interface NewStakingPoolHook {
  helper?: NewStakingHelper;
  pool?: NewStakingPool;
  category?: string;
  // userBalanceStakingToken?: string;
  // userAllowanceStakingToken?: string;
  // userStakedAmount?: string;
  // userEarnedAmount?: string;
}

export function useNewStakingPool(
  state: NewStakingState,
  categories: Record<string, string>,
  indexOrSymbol: number | string
): NewStakingPoolHook {
  if (!state.helper) return {};
  const pool = typeof indexOrSymbol == 'number'
    ? state.helper.pools[indexOrSymbol]
    : state.helper.pools.find(p => p.symbol.toLowerCase() === indexOrSymbol.toLowerCase());
  if (!pool) return {};
  return {
    // userBalanceStakingToken: pool.userBalanceStakingToken ? formatBalance(pool.userBalanceStakingToken, 18, 4) : '0',
    // userAllowanceStakingToken: pool.userAllowanceStakingToken ? formatBalance(pool.userAllowanceStakingToken, 18, 4) : '0',
    // userEarnedAmount: pool.userEarnedRewards ? formatBalance(pool.userEarnedRewards, 18, 6) : '0',
    // userStakedAmount: pool.userStakedBalance ? formatBalance(pool.userStakedBalance, 18, 6) : '0',
    category: categories[pool.token],
    helper: state.helper,
    pool
  }
}

export type NewStakingContextType = {
  ndxPrice: number | undefined;
  ethPrice: number | undefined;
  stakingTokenPrices: { [token: string]: number } | undefined;
  helper: NewStakingHelper;
  useStakingPool(indexOrSymbol: number | string): NewStakingPoolHook;
  categories: Record<string, string>;
}

export function useNewStaking(): NewStakingContextType {
  const [state, dispatch] = useReducer(newStakingReducer, newStakingInitialState);
  const { state: globalState } = useContext(store);
  const pairAddresses = useMemo(() => [
    ...state.helper?.pools.filter(p => p.isPairToken).map(p => p.token) || [],
    WETH_NDX_PAIR
  ], [state.helper]);
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
      const helper = await NewStakingHelper.create(toProvider(provider), globalState.account);
      dispatch({ type: 'LOAD_HELPER', helper });
    }
    loadStakingPools();
  }, []);

  useEffect(() => {
    const account = globalState.account;
    if (!state.helper || !account) return;
    const setAccount = async () => {
      if (state.helper.userAddress) return;
      state.helper.setUserAddress(account);
    }
    setAccount();
  }, [ globalState.account, state.helper ])

  const {
    categories,
    stakingTokenPrices
  }: {
    categories: { [address: string]: string }
    stakingTokenPrices: { [address: string]: number }
  } = useMemo(
    () => {
      if (
        !ethPrice || !indexPoolHelpers || !state.helper ||
        !state.helper.pools.length || !indexPoolHelpers.length || loadingPairs ||
        !pairsData
      ) {
        return {
          categories: {},
          stakingTokenPrices: undefined
        };
      }
      return state.helper.pools.reduce(({
        categories, stakingTokenPrices
      }, pool) => {
        let price = 0, indexPool: string = '', category = '';
        if (pool.isPairToken) {
          const pair = pairsData[pool.token];
          if (pair) {
            if (pair.token0.toLowerCase() === WETH.toLowerCase()) {
              price = pair.reserve0.times(2).div(pair.totalSupply).toNumber() * ethPrice;
              indexPool = pair.token1.toLowerCase()
            } else {
              price = pair.reserve1.times(2).div(pair.totalSupply).toNumber() * ethPrice;
              indexPool = pair.token0.toLowerCase()
            }
            const poolHelper = indexPoolHelpers.find(h => h.address.toLowerCase() === indexPool.toLowerCase());
            if (poolHelper) {
              category = poolHelper.pool.category;
            }
          }
        } else {
          indexPool = pool.token;
          const poolHelper = indexPoolHelpers.find(h => h.address.toLowerCase() === indexPool.toLowerCase());
          if (poolHelper) {
            ({ price } = (globalState.indexes && globalState.indexes[poolHelper.symbol]) || { price: 0 });
            category = poolHelper.pool.category;
          }
        }
        return {
          categories: { ...categories, [pool.token]: category },
          stakingTokenPrices: { ...stakingTokenPrices, [pool.token]: price }
        }
      }, {
        stakingTokenPrices: {},
        categories: {}
      })
    },
    [loadingPairs, state.helper, indexPoolHelpers, globalState.indexes, pairsData, ethPrice]
  );

  return {
    helper: state.helper,
    useStakingPool: (indexOrSymbol: string | number) => useNewStakingPool(state, categories, indexOrSymbol),
    ndxPrice,
    ethPrice,
    categories,
    stakingTokenPrices
  }
}
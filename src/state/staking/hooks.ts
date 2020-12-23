import { formatBalance, getStakingHelpers, PoolHelper, StakingPoolHelper } from '@indexed-finance/indexed.js'
import { useContext, useEffect, useReducer } from 'react';
import { AddPools, SetMetadata, StakingAction } from './actions';
import { store } from '../index'

import { StakingState, stakingInitialState, stakingReducer, StakingPoolMetadata } from './reducer';

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
  pools: StakingPoolHelper[];
  metadata: { [key: string]: StakingPoolMetadata };
  useStakingPool(indexOrSymbol: number | string): StakingPoolHook;
}

export function useStaking(): StakingContextType {
  const [state, dispatch] = useReducer(stakingReducer, stakingInitialState);
  const { state: globalState } = useContext(store);

  useEffect(() => {
    console.log(globalState)
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
    const setAccount = () => {
      console.log('SETTING ACCOUNT TO ', account)
      for (let pool of state.pools) {
        if (pool.userAddress) return;
        pool.setUserAddress(account);
      }
    }
    setAccount();
  }, [ globalState.account, state.pools ])

  useEffect(() => {
    const indexPoolHelpers: undefined | PoolHelper[] = globalState.didLoadHelper && globalState.helper.initialized;
    if (
      Object.keys(state.metadata).length ||
      !state.pools.length ||
      !indexPoolHelpers
    ) return;

    const setMetadata = () => {
      const actions: StakingAction[] = [];
      for (let pool of state.pools) {
        const { indexPool } = pool.pool;
        const helper = indexPoolHelpers.find(h => h.address.toLowerCase() == indexPool.toLowerCase());
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
            stakingSymbol
          }
        });
      }
      dispatch(actions);
    }
    setMetadata();
  }, [ globalState.didLoadHelper, state.pools ]);

  return {
    pools: state.pools,
    metadata: state.metadata,
    useStakingPool: (indexOrSymbol: string | number) => useStakingPool(state, indexOrSymbol)
  }
}
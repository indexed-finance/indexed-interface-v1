import { useEffect, useMemo, useState, useContext } from "react";
import { useWeb3 } from "./useWeb3";
import IERC20 from '../assets/constants/abi/IERC20.json';

import { NDX, WETH } from "../assets/constants/addresses";
import { useStakingState } from "../state/staking/context";
import { toContract } from "../lib/util/contracts";
import { BigNumber, formatBalance, PoolHelper, toBN } from "@indexed-finance/indexed.js";
import { store } from '../state';
import { useUniswapPairsWithLoadingIndicator } from "./useUniswapPairs";
import { getETHPrice } from "../api/gql";

export function useUserBalance(token: string): BigNumber | undefined {
  const [loading, setLoading] = useState(false);
  const { provider, account, loggedIn } = useWeb3();
  const [balance, setBalance] = useState(undefined as BigNumber | undefined);

  useEffect(() => {
    if (loading === true || !loggedIn) return;
    setLoading(true);
    const erc20 = toContract(provider, IERC20.abi, token);
    erc20.methods.balanceOf(account).call().then((bal) => {
      setLoading(false);
      setBalance(toBN(bal));
    }).catch(() => {
      setLoading(false)
    })
  }, [ loggedIn, account ]);
  return balance;
}

interface UserRewards {
  ndxBalance: number;
  earned: number;
  total: number;
}

export function useUserRewards(): UserRewards | undefined {
  const { loggedIn } = useWeb3();
  const { pools } = useStakingState();
  const balanceExact = useUserBalance(NDX);
  return useMemo(() => {
    if (!loggedIn || !pools.length || !balanceExact) return undefined;
    const earnedExact = pools.reduce((t, p) => t.plus(p.userEarnedRewards || toBN(0)), toBN(0));
    const ndxBalance = parseFloat(formatBalance(balanceExact, 18, 3));
    const earned = parseFloat(formatBalance(earnedExact, 18, 3));
    return {
      ndxBalance,
      earned,
      total: parseFloat((ndxBalance + earned).toFixed(2))
    }
  }, [loggedIn, balanceExact, pools])
}

export interface PortfolioToken {
  symbol: string;
  balance: number;
  staked: number;
  price: number;
  value: number;
  earned: number;
  category: number;
  stakingPoolAddress: string;
}

export interface UserPortfolioData {
  totalValue: number;
  tokens: PortfolioToken[];
}

export function useEtherPrice(): number | undefined {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(undefined);
  function update() {
    if (loading) return;
    setLoading(true)
    getETHPrice().then((price_) => {
      setPrice(price_);
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }
  useEffect(() => update(), []);
  return price;
}

export function usePortfolioValue(): UserPortfolioData {
  const { account } = useWeb3();
  const { state } = useContext(store);
  const { pools: stakingPools } = useStakingState();
  const pairAddresses = useMemo(() => stakingPools.filter(p => p.pool.isWethPair).map(p => p.stakingToken), [stakingPools]);
  const ethPrice = useEtherPrice();
  const [pairsData, loadingPairs] = useUniswapPairsWithLoadingIndicator(pairAddresses);

  const pools: PoolHelper[] | undefined = useMemo(() => state.helper && state.helper.initialized, [state]);

  return useMemo(() => {
    if (!pools || !stakingPools || !pools.length || !stakingPools.length || loadingPairs || !ethPrice) {
      return {
        totalValue: 0,
        tokens: []
      }
    }
    let totalValue = 0;
    let tokens: PortfolioToken[] = [];
    stakingPools.forEach((stakingPool) => {
      const pool = pools.find(p => p.address.toLowerCase() === stakingPool.pool.indexPool.toLowerCase());
      let price: number;
      if (stakingPool.pool.isWethPair) {
        const pair = pairsData[stakingPool.stakingToken];
        if (pair.token0.toLowerCase() === WETH.toLowerCase()) {
          price = pair.reserve0.times(2).div(pair.totalSupply).toNumber() * ethPrice;
        } else {
          price = pair.reserve1.times(2).div(pair.totalSupply).toNumber() * ethPrice;
        }
      } else {
        ({ price } = state.indexes[pool.symbol]);
      }

      const balanceExact = stakingPool.userBalanceStakingToken || toBN(0);
      const balance = parseFloat(formatBalance(balanceExact, 18, 3));
      const earnedExact = stakingPool.userEarnedRewards || toBN(0);
      const earned = parseFloat(formatBalance(earnedExact, 18, 3));
      const stakedExact = stakingPool.userBalanceRewards || toBN(0);
      const staked = parseFloat(formatBalance(stakedExact, 18, 3));
      const balanceTotal = balance + staked;
      const value = parseFloat((balanceTotal * price).toFixed(2));
      const symbol = stakingPool.pool.isWethPair ? `UNIV2:ETH-${pool.symbol}` : pool.symbol;
      tokens.push({
        value,
        symbol,
        price,
        earned,
        staked,
        balance,
        category: pool.pool.category,
        stakingPoolAddress: stakingPool.rewardsAddress
      });
      totalValue += value;
    });
    return {
      totalValue: parseFloat(totalValue.toFixed(2)),
      tokens
    }
  }, [stakingPools, pools, pairsData, account, loadingPairs, ethPrice, state])
}
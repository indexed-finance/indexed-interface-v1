import { useEffect, useMemo, useState } from "react";
import { MultiCall, CallInput } from '@indexed-finance/multicall'
import { useWeb3 } from "./useWeb3";
import IUniswapV2Pair from '../assets/constants/abi/IUniswapV2Pair.json';
import IERC20 from '../assets/constants/abi/IERC20.json';
import { NDX, WETH } from "../assets/constants/addresses";
import { useStaking } from "../state/staking/hooks";
import { toContract } from "../lib/util/contracts";
import { BigNumber, toBN } from "@indexed-finance/indexed.js";

interface UniswapPair {
  reserve0: BigNumber;
  reserve1: BigNumber;
  totalSupply: BigNumber;
  token0: string;
  token1: string;
}

interface UniswapPairs {
  [pair: string]: UniswapPair | undefined;
}

export function useUniswapPairsWithLoadingIndicator(pairs: string[]): [UniswapPairs, boolean] {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({} as UniswapPairs);
  const { provider, loggedIn } = useWeb3();
  const multi = useMemo(() => new MultiCall(provider), [ loggedIn ]);
  const calls: CallInput[] = useMemo(
    () => pairs.reduce((arr, pair) => [
      ...arr,
      { target: pair, function: 'totalSupply', interface: IUniswapV2Pair },
      { target: pair, function: 'token0', interface: IUniswapV2Pair },
      { target: pair, function: 'token1', interface: IUniswapV2Pair },
      { target: pair, function: 'getReserves', interface: IUniswapV2Pair }

    ], []),
    [pairs]
  );

  function update() {
    if (loading === true) return;
    setLoading(true);
    multi.multiCall(calls).then((results) => {
      const pairsData = pairs.reduce((obj, pair, i) => {
        const result = results.slice(i * 4);
        const [totalSupply, token0, token1, reserves] = result;
        const [reserve0, reserve1] = reserves;
        console.log({
          totalSupply,
          token0,
          token1,
          reserve0,
          reserve1
        })
        return {
          ...obj,
          [pair]: {
            totalSupply: toBN(totalSupply),
            token0,
            token1,
            reserve0: toBN(reserve0),
            reserve1: toBN(reserve1)
          }
        }
      }, {});
      setResult(pairsData);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    })
  }

  useEffect(() => {
    if (loading) return;
    update()
  }, [ pairs ]);

  return [result, loading || Object.keys(result).length === 0];
}
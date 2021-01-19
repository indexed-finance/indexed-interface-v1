import React, { useContext } from "react";
import useInterval from '../hooks/useInterval';
import { useStakingState } from "./staking/context";

export function PoolsUpdater() {
  const { pools } = useStakingState()
  useInterval(() => {
    console.log('running pools updater')
    if (pools && pools.length) {
      for (let pool of pools) {
        pool.updatePool()
      }
    }
  }, 10000)

  return <></>
}
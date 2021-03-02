import { getStakingHelpers, PoolHelper, StakingPoolHelper } from '@indexed-finance/indexed.js'
import { useContext, useEffect, useReducer } from 'react';
import { AddPools, SetMetadata, StakingAction } from './actions';
import { store } from '../index'

export interface StakingPoolMetadata {
  indexPoolName: string;
  indexPoolSymbol: string;
  indexPoolTokenSymbols: string[];
  stakingSymbol: string;
  poolCategory: string;
}

export interface StakingState {
  pools: StakingPoolHelper[];
  metadata: { [key: string]: StakingPoolMetadata };
}

const initialState: StakingState = {
  pools: [],
  metadata: {}
};

export const stakingInitialState = initialState;

export function stakingReducer(state: StakingState = initialState, action_: StakingAction | StakingAction[]): StakingState {
  const newState = { ...state };
  const actions = Array.isArray(action_) ? action_ : [action_];

  function addPools(action: AddPools) {
    newState.pools = action.pools;
  }

  function addPoolMetadata(action: SetMetadata) {
    newState.metadata[action.id] = action.metadata;
  }

  for (let action of actions) {
    switch (action.type) {
      case 'ADD_POOLS': { addPools(action); break; }
      case 'SET_METADATA': { addPoolMetadata(action); break; }
    }
  }
  return newState;
}
/* 
export interface 

export function useStakingPool(state: StakingState, address: string) {

} */



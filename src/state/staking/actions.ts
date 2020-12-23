import { StakingPoolHelper } from '@indexed-finance/indexed.js'
import { StakingPoolMetadata } from './reducer';

export type AddPools = { type: 'ADD_POOLS', pools: StakingPoolHelper[] };
export type LoadInitial = { type: 'LOAD_INIT' };
export type SetMetadata = { type: 'SET_METADATA', id: string, metadata: StakingPoolMetadata };

export type StakingAction = AddPools | SetMetadata;
export type StakingMiddlewareAction = LoadInitial;
export type StakingDispatch = (actions: StakingAction | StakingAction[]) => void;
// import { getStakingHelpers } from "@indexed-finance/indexed.js";
// import { withMiddleware } from "../middleware";
// import { StakingAction, StakingMiddlewareAction, StakingDispatch } from "./actions";
// import { StakingState } from './reducer';

// type StakingDispatchType = (action: StakingMiddlewareAction | StakingAction) => Promise<void>;

// export const withStakingMiddleware = (state: StakingState, dispatch: StakingDispatch): StakingDispatchType => withMiddleware(state, dispatch)(stakingMiddleware);

// export const stakingMiddleware = (state: StakingState) => (next: StakingDispatch) => stakingDispatchMiddleware(next, state);

// function stakingDispatchMiddleware(dispatch: StakingDispatch, state: StakingState) {
//   return (action: StakingMiddlewareAction | StakingAction): Promise<void> => {
//     switch (action.type) {
//       case 'LOAD_INIT': {
//         const pools = await getStakingHelpers()
//       }
//       default: break;
//     }
//   }
// }

import React from 'react';

export function hello() {}
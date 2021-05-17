import { NewStakingHelper } from '@indexed-finance/indexed.js'

export interface NewStakingState {
  helper?: NewStakingHelper
}

export const newStakingInitialState: NewStakingState = {};

export type NewStakingAction = {
  type: 'LOAD_HELPER',
  helper: NewStakingHelper
}

export function newStakingReducer(
  state: NewStakingState = newStakingInitialState,
  action: NewStakingAction
): NewStakingState {
  const newState = { ...state };
  switch(action.type) {
    case 'LOAD_HELPER': {
      newState.helper = action.helper;
      break;
    }
  }
  return newState;
}
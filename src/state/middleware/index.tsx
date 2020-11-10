import { compose } from "ramda";
import { MiddlewareAction, MintDispatch, MintDispatchAction } from "../actions/mint-actions";
import { MintState } from "../reducers/mint-reducer";
import { mintMiddleware } from "./mint-middleware";

export const withMiddleware = (state, dispatch) => (...middlewares) =>
  compose(...middlewares.map(mf => mf(state)))(dispatch);

type MintDispatchType = (action: MiddlewareAction | MintDispatchAction) => Promise<void>;

export const withMintMiddleware = (state: MintState, dispatch: MintDispatch): MintDispatchType => withMiddleware(state, dispatch)(mintMiddleware);
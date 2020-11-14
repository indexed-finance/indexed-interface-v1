import { compose } from "ramda";

export const withMiddleware = (state, dispatch) => (...middlewares) =>
  compose(...middlewares.map(mf => mf(state)))(dispatch);

export { withMintMiddleware } from './mint-middleware';

export { withBurnMiddleware } from './burn-middleware';

export { withInitMiddleware } from './initializer-middleware';

export { withTradeMiddleware } from './trade-middleware';
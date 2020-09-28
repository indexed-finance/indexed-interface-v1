import Decimal from 'decimal.js';

export function calcRelativeDiff(expected, actual) {
  return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

export function calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee) {
  const numer = Decimal(tokenBalanceIn).div(Decimal(tokenWeightIn));
  const denom = Decimal(tokenBalanceOut).div(Decimal(tokenWeightOut));
  const ratio = numer.div(denom);
  const scale = Decimal(1).div(Decimal(1).sub(Decimal(swapFee)));
  const spotPrice = ratio.mul(scale);
  return spotPrice;
}

export function calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee) {
  const weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
  const adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
  const y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
  const foo = y.pow(weightRatio);
  const bar = Decimal(1).minus(foo);
  const tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
  return tokenAmountOut;
}

export function calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee) {
  const weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
  const diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
  const y = Decimal(tokenBalanceOut).div(diff);
  const foo = y.pow(weightRatio).minus(Decimal(1));
  const tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
  return tokenAmountIn;
}

export function calcPoolOutGivenSingleIn(tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, tokenAmountIn, swapFee) {
  const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
  const zaz = Decimal(1).sub(Decimal(normalizedWeight)).mul(Decimal(swapFee));
  const tokenAmountInAfterFee = Decimal(tokenAmountIn).mul(Decimal(1).sub(zaz));
  const newTokenBalanceIn = Decimal(tokenBalanceIn).add(tokenAmountInAfterFee);
  const tokenInRatio = newTokenBalanceIn.div(Decimal(tokenBalanceIn));
  const poolRatio = tokenInRatio.pow(normalizedWeight);
  const newPoolSupply = poolRatio.mul(Decimal(poolSupply));
  const poolAmountOut = newPoolSupply.sub(Decimal(poolSupply));
  return poolAmountOut;
}

export function calcSingleInGivenPoolOut(tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, poolAmountOut, swapFee) {
  const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
  const newPoolSupply = Decimal(poolSupply).plus(Decimal(poolAmountOut));
  const poolRatio = newPoolSupply.div(Decimal(poolSupply));
  const boo = Decimal(1).div(normalizedWeight);
  const tokenInRatio = poolRatio.pow(boo);
  const newTokenBalanceIn = tokenInRatio.mul(Decimal(tokenBalanceIn));
  const tokenAmountInAfterFee = newTokenBalanceIn.sub(Decimal(tokenBalanceIn));
  const zar = (Decimal(1).sub(normalizedWeight)).mul(Decimal(swapFee));
  const tokenAmountIn = tokenAmountInAfterFee.div(Decimal(1).sub(zar));
  return tokenAmountIn;
}

export function calcSingleOutGivenPoolIn(
  tokenBalanceOut,
  tokenWeightOut,
  poolSupply,
  totalWeight,
  poolAmountIn,
  swapFee
) {
  const normalizedWeight = Decimal(tokenWeightOut).div(Decimal(totalWeight));
  const poolAmountInAfterExitFee = Decimal(poolAmountIn); // 0 exit fee
  const newPoolSupply = Decimal(poolSupply).sub(poolAmountInAfterExitFee);
  const poolRatio = newPoolSupply.div(Decimal(poolSupply));
  const boo = Decimal(1).div(normalizedWeight);
  const tokenOutRatio = poolRatio.pow(boo);
  const newTokenBalanceOut = tokenOutRatio.mul(Decimal(tokenBalanceOut));
  const tokenAmountOutBeforeSwapFee = Decimal(tokenBalanceOut).sub(newTokenBalanceOut);
  const zaz = (Decimal(1).sub(normalizedWeight)).mul(Decimal(swapFee));
  const tokenAmountOut = Decimal(tokenAmountOutBeforeSwapFee).mul(
    Decimal(1).sub(zaz)
  );
  return tokenAmountOut;
}

/* (extPrice / mktPrice) ** (weight) */

export function calcInGivenPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, externalPrice, swapFee) {
  const marketPrice = calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee);
  const priceRatio = Decimal(externalPrice).div(marketPrice);
  const weightSum = Decimal(tokenWeightOut).add(tokenWeightIn);
  const weightExp = Decimal(tokenWeightOut).div(weightSum);
  const foo = priceRatio.pow(weightExp);
  const bar = foo.sub(Decimal(1));
  const tokenAmountIn = Decimal(tokenBalanceIn).mul(bar);
  return tokenAmountIn;
}

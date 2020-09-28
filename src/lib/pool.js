import {
  calcSpotPrice,
  calcOutGivenIn,
  calcSingleInGivenPoolOut,
  calcInGivenOut,
  calcInGivenPrice,
  calcPoolOutGivenSingleIn,
  calcSingleOutGivenPoolIn
} from "./calc_comparisons";

import Decimal from 'decimal.js'
import BN from 'bn.js'

const swapFee = 0.025;

const isHex = (str) => Boolean(/[xabcdef]/g.exec(str))

const toBN = (value) => {
  if (BN.isBN(value)) return value;
  if (typeof value == 'number') return new BN(value);
  if (typeof value == 'string') {
    if (value.slice(0, 2) == '0x') {
      return new BN(value.slice(2), 'hex');
    }
    return new BN(value, isHex(value) ? 'hex' : undefined);
  }
  if (Decimal.isDecimal(value)) {
    return new BN(+value);
  }
  return new BN(value);
}

export default class Pool {
  constructor(web3, tokens, totalSupply) {
    this.web3 = web3;
    const fromWei = (_bn) => +(web3.utils.fromWei(toBN(_bn).toString(10)));
    this.tokens = [];
    this.records = {};
    const totalDenorm = tokens.map(t => fromWei(t.denorm)).reduce((a,b) => a+b, 0);

    for (let t of tokens) {
      this.tokens.push(t.address);
      const weight = (fromWei(t.denorm)) / totalDenorm;
      this.records[t.address] = {
        balance: fromWei(t.balance),
        weight
      };
    }

    this.totalWeight = totalDenorm;
    this.totalSupply = fromWei(totalSupply)
  }

  fromWei(_bn) {
    return +(this.web3.utils.fromWei(toBN(_bn).toString(10)));
  }

  toWei(_bn) {
    return this.web3.utils.toWei(toBN(_bn).toString(10));
  }

  decToWeiHex(dec) {
    let str = String(dec);
    if (str.includes('.')) {
      const comps = str.split('.');
      if (comps[1].length > 18) {
        str = `${comps[0]}.${comps[1].slice(0, 18)}`;
      }
    }
    return `0x` + new BN(this.web3.utils.toWei(str)).toString('hex');
  }

  static async getPool(web3, poolContract) {
    const tokens = await poolContract.methods.getCurrentTokens().call();
    const _records = await Promise.all(tokens.map(t => poolContract.methods.getTokenRecord(t).call()));
    const records = [];
    for (let i = 0; i < tokens.length; i++) {
      const address = tokens[i];
      const { denorm, balance } = _records[i];
      records.push({ address, denorm, balance })
    }
    const totalSupply = await poolContract.methods.totalSupply().call();
    return new Pool(web3, records, totalSupply);
  }

  // Calculate amount of `outToken` you can get for `inAmount` of `inToken`
  calcOutGivenIn(inToken, outToken, inAmount) {
    inAmount = this.fromWei(inAmount)
    const { balance: bI, weight: wI } = this.records[inToken];
    const { balance: bO, weight: wO } = this.records[outToken];
    const outAmount = calcOutGivenIn(bI, wI, bO, wO, inAmount, swapFee);
    return this.decToWeiHex(outAmount);
  }

  // Calculate amount of `inToken` you must give for `outAmount` of `outToken`
  calcInGivenOut(inToken, outToken, outAmount) {
    outAmount = this.fromWei(outAmount);
    const { balance: bI, weight: wI } = this.records[inToken];
    const { balance: bO, weight: wO } = this.records[outToken];
    const inAmount = calcInGivenOut(bI, wI, bO, wO, outAmount, swapFee);
    return this.decToWeiHex(inAmount);
  }

  // Calculate amount of `inToken` you must give to mint `poolAmountOut` pool tokens
  calcSingleInGivenPoolOut(inToken, poolAmountOut) {
    poolAmountOut = this.fromWei(poolAmountOut)
    const { balance: bI, weight: wI } = this.records[inToken];
    const inAmount = calcSingleInGivenPoolOut(
      bI, wI, this.totalSupply, this.totalWeight, poolAmountOut, swapFee
    );
    return this.decToWeiHex(inAmount);
  }

  calcSpotPrice(inToken, outToken) {
    const { balance: bI, weight: wI } = this.records[inToken];
    const { balance: bO, weight: wO } = this.records[outToken];
    const spotPrice = calcSpotPrice(
      bI, wI, bO, wO, swapFee
    );
    return this.toWei(spotPrice);
  }

  // Calculate amount of pool tokens you can mint for `inAmount` of `inToken`
  calcPoolOutGivenSingleIn(inToken, inAmount) {
    inAmount = this.fromWei(inAmount)
    const { balance: bI, weight: wI } = this.records[inToken];
    const poolAmountOut = calcPoolOutGivenSingleIn(
      bI,
      wI,
      this.totalSupply,
      this.totalWeight,
      inAmount,
      swapFee
    );
    return this.decToWeiHex(poolAmountOut);
  }

  // Calculate the amount of `outToken` you can get by burning `poolAmountIn` pool tokens
  calcSingleOutGivenPoolIn(outToken, poolAmountIn) {
    poolAmountIn = this.fromWei(poolAmountIn);
    const { balance: bO, weight: wO } = this.records[outToken];
    const tokenAmountOut = calcSingleOutGivenPoolIn(
      bO,
      wO,
      this.totalSupply,
      this.totalWeight,
      poolAmountIn,
      swapFee
    );
    return this.decToWeiHex(tokenAmountOut);
  }

  // Calculate the amounts of each underlying token you can get by burning `poolAmountIn` pool tokens
  // Returns an array of { address, amount }
  calcAllOutGivenPoolIn(poolAmountIn) {
    poolAmountIn = this.fromWei(poolAmountIn);
    const poolTotal = this.totalSupply;
    const ratio = poolAmountIn / poolTotal;
    let amountsOut = [];
    for (let t of this.tokens) {
      const { balance: bO } = this.records[t];
      const tokenAmountOut = ratio * bO;
      amountsOut.push({
        address: t,
        amount: this.decToWeiHex(tokenAmountOut)
      });
    }
    return amountsOut;
  }
}

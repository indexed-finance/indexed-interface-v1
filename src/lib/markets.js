import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import UniV2PairABI from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'
import UniV2FactoryABI from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import BPool from '../assets/constants/abi/BPool.json'

import { toContract } from './util/contracts'
import Decimal from 'decimal.js'
import BN from 'bn.js'

const FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const fromWei = (web3, _bn) => Decimal(web3.utils.fromWei(web3.utils.toBN(_bn).toString(10)));
export const toWei = (web3, _bn) => Decimal(web3.utils.toWei(web3.utils.toBN(_bn).toString(10)));
const oneToken = new BN('de0b6b3a7640000', 'hex');

// Convert a decimal value to a big number, multiplying by 1e18

export const decToWeiHex = (web3, dec) => {
  let str = String(dec);
  if (str.includes('.')) {
    const comps = str.split('.');
    if (comps[1].length > 18) {
      str = `${comps[0]}.${comps[1].slice(0, 18)}`;
    }
  }
  return `0x` + new BN(web3.utils.toWei(str)).toString('hex');
}

export async function getPair(web3, addressOne, addressTwo){
  const factory = toContract(web3, UniV2FactoryABI.abi, FACTORY)
  const pairAddress = await factory.methods.getPair(
    addressOne,
    addressTwo
  ).call()

  return toContract(web3, UniV2PairABI.abi, pairAddress)
}

export async function getRouter(web3){
  return toContract(web3, UniswapV2Router.abi, ROUTER)
}

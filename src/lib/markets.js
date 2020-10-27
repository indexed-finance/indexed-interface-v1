import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import UniV2PairABI from '@uniswap/v2-periphery/build/IUniswapV2Pair.json'
import UniV2FactoryABI from '@uniswap/v2-periphery/build/IUniswapV2Factory.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import BPool from '../assets/constants/abi/BPool.json'

import MarketOracle from './market-oracle'
import { toContract } from './util/contracts'
import Pool from './pool.js'
import Decimal from 'decimal.js'
import BN from 'bn.js'

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
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

export async function getPair(web3, tokenAddress){
  const factory = toContract(web3, UniV2FactoryABI.abi, FACTORY)
  const pairAddress = await factory.methods.getPair(
    WETH,
    tokenAddress
  ).call()

  return toContract(web3, UniV2PairABI.abi, pairAddress)
}

export async function getBalances(web3, address, array, map){
  let tokens = array.map(v => { return { address: v.address, symbol: v.symbol }})
  tokens.push({ address: WETH, symbol: 'ETH' })

  for(let token in tokens){
    let contract = toContract(web3, IERC20.abi, tokens[token].address)
    let balance = await contract.methods.balanceOf(address).call()

    if(tokens[token].address == WETH){
      balance = await web3.eth.getBalance(address)
    }

    map[tokens[token].symbol] = {
      amount: (balance/Math.pow(10,18)).toFixed(2),
      address: tokens[token].address,
    }
  }
  return map
}

export async function getRouter(web3){
  return toContract(web3, UniswapV2Router.abi, ROUTER)
}

export async function getRateSingle(web3, poolAddress, tokenAddress, poolTokensToMint) {
  let contract = toContract(web3, BPool.abi, poolAddress)
  let asset = toContract(web3, IERC20.abi, tokenAddress)
  let pool = await Pool.getPool(web3, contract)
  let input = oneToken.muln(+poolTokensToMint)
  let amount = await pool.calcPoolOutGivenSingleIn(tokenAddress, input)
  let symbol = await asset.methods.symbol().call()
  let address = tokenAddress

  return [{ amount, symbol, address }]
}

export async function getRateMulti(web3, poolAddress, poolTokensToMint, opt){
  let contract = toContract(web3, BPool.abi, poolAddress)
  let pool = await Pool.getPool(web3, contract)
  let input = oneToken.muln(+poolTokensToMint)
  let output = await pool.calcAllOutGivenPoolIn(input, opt)
  let rates = []

  for(let token in output){
    let { amount, address } = output[token]
    let asset = toContract(web3, IERC20.abi, address)
    let symbol = await asset.methods.symbol().call()

    rates.push({ amount, symbol, address })
  }
  return rates
}

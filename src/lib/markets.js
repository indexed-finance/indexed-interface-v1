import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import UniV2PairABI from '../assets/constants/abi/IUniswapV2Pair.json'
import UniV2FactoryABI from '../assets/constants/abi/IUniswapV2Factory.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import BPool from '../assets/constants/abi/BPool.json'

import Uniswap from './uniswap'
import MarketOracle from './market-oracle'
import { toContract } from './util/contracts'
import Pool from './pool.js'
import Decimal from 'decimal.js'
import BN from 'bn.js'

const WETH = '0x554Dfe146305944e3D83eF802270b640A43eED44'
const FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

const fromWei = (web3, _bn) => Decimal(web3.utils.fromWei(web3.utils.toBN(_bn).toString(10)));
const toWei = (web3, _bn) => Decimal(web3.utils.toWei(web3.utils.toBN(_bn).toString(10)));

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

export async function getWeights(contract) {
  return await contract.methods.getCurrentTokens().call();
}

export async function getUsedBalances(web3, contract, tokens) {
  let proms = [];
  for (let token of tokens) {
    proms.push(
      contract.methods.getUsedBalance(token).call()
      .then((o) => fromWei(web3, o))
    )
  }
  return await Promise.all(proms);
}

export async function getRate(web3, poolTokensToMint, poolAddress) {
  let contract = toContract(web3, BPool.abi, poolAddress)
  let tokens = await getWeights(contract)
  let usedBalances = await getUsedBalances(web3, contract, tokens)
  let totalSupply = await contract.methods.totalSupply().call()
  .then((o) => fromWei(web3, o))
  let ratio = Decimal(poolTokensToMint).div(totalSupply)
  let inputs = []

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    let bal = usedBalances[i]
    let asset = toContract(web3, IERC20.abi, token)
    let symbol = await asset.methods.symbol().call()
    // add 1% to be extra craeful about math
    let inputAmount = bal.mul(ratio).mul(0.99)

    inputs.push({
      amount: decToWeiHex(web3, inputAmount),
      symbol: symbol
    })
  }
  return inputs;
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
  let tokens = array.map(values => { return { ...values }})
  tokens.push({ symbol: 'ETH', address: WETH })

  for(let token in tokens){
    let contract = toContract(web3, IERC20.abi, tokens[token].address)
    let balance = await contract.methods.balanceOf(address).call()

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

export async function getTokens(web3, poolAddress) {
  let contract = toContract(web3, BPool.abi, poolAddress)
  let tokens = await contract.methods.getCurrentTokens().call()
  let array = []

  for(let token in tokens){
    let address = tokens[token]
    let asset = toContract(web3, IERC20.abi, tokens[token])
    let symbol = await asset.methods.symbol().call()

    array.push({ address, symbol })
  }
  return array
}

export async function getSpecificRate(web3, poolAddress, tokenAddress, poolTokensToMint) {
  let contract = toContract(web3, BPool.abi, poolAddress)
  let asset = toContract(web3, IERC20.abi, tokenAddress)
  const oneToken = new BN('de0b6b3a7640000', 'hex');
  let input = oneToken.muln(poolTokensToMint);
  let pool = await Pool.getPool(web3, contract)

  let symbol = await asset.methods.symbol().call()
  let amount = await pool.calcPoolOutGivenSingleIn(tokenAddress, poolTokensToMint * Math.pow(10, 18))

  console.log(amount)

  return [{ amount, symbol }]
}

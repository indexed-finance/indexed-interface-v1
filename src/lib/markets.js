import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json'
import UniV2PairABI from '../assets/constants/abi/IUniswapV2Pair.json'
import UniV2FactoryABI from '../assets/constants/abi/IUniswapV2Factory.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import BPool from '../assets/constants/abi/BPool.json'

import Uniswap from './uniswap'
import MarketOracle from './market-oracle'
import { toContract } from './util/contracts'

const WETH = '0x554Dfe146305944e3D83eF802270b640A43eED44'
const FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

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

async function getUsedBalances(contract, tokens) {
  let proms = [];
  for (let token of tokens) {
    proms.push(contract.methods.getUsedBalance(token).call())
  }
  return await Promise.all(proms);
}

export async function getConversionRate(web3, amount, poolAddress) {
  let { toBN, hexToNumberString } = web3.utils
  amount = toBN(amount).mul(toBN(1e18))
  let inputs = []

  let contract = toContract(web3, BPool.abi, poolAddress)
  let tokens = await contract.methods.getCurrentTokens().call()
  let totalSupply = await contract.methods.totalSupply().call()
  let usedBalances = await getUsedBalances(contract, tokens)

  for (let i = 0; i < tokens.length; i++) {
    let asset = toContract(web3, IERC20.abi, tokens[i])
    let symbol = await asset.methods.symbol().call()
    let inputAmount = toBN(usedBalances[i]).mul(amount)
    .sub(toBN(10)).div(toBN(totalSupply))

    inputs.push({
       amount: inputAmount,
       symbol: symbol
    })
  }
  return inputs
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

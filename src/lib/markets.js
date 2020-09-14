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
  for(let token in array){
    let contract = toContract(web3, IERC20.abi, array[token])
    let balance = await contract.methods.balanceOf(address).call()

    map[array[token]] = balance
  }
  return map
}

export async function getRouter(web3){
  return toContract(web3, UniswapV2Router.abi, ROUTER)
}

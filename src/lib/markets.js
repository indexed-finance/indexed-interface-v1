import UniV2PairABI from '../assets/constants/abi/IUniswapV2Pair.json'
import UniV2FactoryABI from '../assets/constants/abi/IUniswapV2Factory.json'

import Uniswap from './uniswap'
import MarketOracle from './market-oracle'
import { toContract } from './util/contracts'

const WETH = '0x554Dfe146305944e3D83eF802270b640A43eED44'
const FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export async function getHelpers(web3, from) {
  const contracts = {
    weth: '0x554Dfe146305944e3D83eF802270b640A43eED44',
    uniswapFactory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    mockDeployer: '0xAAfa9CEEA3C146412B22d45FEAE3a69442169227'
  };
  const uniswap = new Uniswap(web3, contracts, from)
  const oracle = new MarketOracle(web3, '0xA9E6b9e97ABE5f384701B6BB8B222a3063D2d071', from)
  return { uniswap, oracle }
}

export async function getPair(web3, tokenAddress){
  const factory = toContract(web3, UniV2FactoryABI.abi, FACTORY)
  const pairAddress = await factory.methods.getPair(
    tokenAddress,
    WETH
  ).call()

  console.log(pairAddress)

  return toContract(web3, UniV2PairABI.abi, pairAddress)
}

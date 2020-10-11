import React from 'react'
import Web3 from 'web3'

import eth from '../images/ethereum.png'
import mkr from '../images/maker.png'
import dai from '../images/dai.png'
import wbtc from '../images/wrappedbitcoin.png'
import comp from '../images/compound.png'
import busd from '../images/busd.png'
import link from '../images/chainlink.png'
import ampl from '../images/ampleforth.png'
import snx from '../images/synthetix.png'
import yfi from '../images/yfi.png'
import usdt from '../images/tether.png'
import usdc from '../images/usdc.png'
import uni from '../images/uni.png'

import { isNative } from './functions'

let currentTime = (new Date()).getHours()
let isNight = (currentTime > 20 || currentTime < 6)

export const initialState = {
  web3: {
    mainnet: new Web3('https://mainnet.infura.io/v3/1c6549e97ff24d9a99ba4e007b538de6'),
    rinkeby: new Web3('https://rinkeby.infura.io/v3/1c6549e97ff24d9a99ba4e007b538de6'),
    injected: false
  },
  background: isNight ? '#111111' : '#ffffff',
  color: isNight ? '#ffffff' : '#333333',
  native: isNative({ width: null }),
  request: false,
  load: false,
  dark: isNight,
  categories: {},
  account: null,
  network: null,
  balances: {
    'ETH': { amount: 0, address: null },
    'YFI': { amount: 0, address: null },
    'COMP': { amount: 0, address: null },
    'DAI': { amount: 0, address: null },
    'USDC': { amount: 0, address: null },
    'USDT': { amount: 0, address: null },
    'YFI': { amount: 0, address: null },
    'MKR': { amount: 0, address: null },
    'LINK': { amount: 0, address: null },
    'BUSD': { amount: 0, address: null },
    'UNI': { amount: 0, address: null },
    'WBTC': { amount: 0, address: null }
  },
  proposals: {
    "0xcd5edd521b1b3b7511b3e968e3d322c875d1cd17b13cd89c9a74fd9086d005f8": { author: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd', title: 'New category: Governance', time: '1D, 14HRS REMAINING', phase: 'active', yes: 50, no: 50, participants: 50, for: '5,000.53 NDX', against: '5,001.53 NDX', action: true, label: 'VOTE' },
    "0xe6858db4c58879821936c5a88df647251814c0520a5da5d2afd8c26a946bed04": { author: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd', title: 'Increase swap fee to 2.5%', phase: 'passed', time: 'BLOCK: 45423', yes: 75, no: 25, participants: 150, for: '25,562.00 NDX', against: '7,531.05 NDX', action: true, label: 'COUNTER' },
    "0xcd5edd521b1b3b7511b3e968e3d322c875d1cd17b13cd89c9a74fd9086d005f8": { author: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd', title: 'New index: [DEFII10]', phase: 'executed', yes: 90,  time: 'BLOCK: 42112', no: 10, participants: 225, action: false, for: '100,459.66 NDX', against: '10,531.11 NDX', label: 'CONCLUDED' },
    "0xa9a01f59b454058d700253430ee234794bde8e04dbe5bb03c10133192543bc09": { author: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd', title: 'Whitelist: [HEX]', phase: 'rejected',  yes: 14.75,  time: 'BLOCK: 40105', no: 85.25, participants: 300, action: false, for: '20,111.33 NDX', against: '500,124.06 NDX', label: 'CONCLUDED' }
  },
  indexes: {},

}

export const tokenMetadata = {
  "USDC": {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    name: "USD Coin",
    image: usdc
  },
  "USDT": {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    name: "Tether",
    image: usdt
  },
  "BUSD": {
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    name: "Binance USD",
    image: busd
  },
  "COMP": {
    address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    name: "Compound",
    image: comp
  },
  "YFI": {
    address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    name: "Yearn",
    image: yfi
  },
  "MKR": {
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    name: "Maker",
    image: mkr
  },
  "DAI": {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    name: "Dai Stablecoin",
    image: dai
  },
  "LINK": {
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    name: "Chainlink",
    image: link
  },
  "ETH": {
    name: "Ethereum",
    image: eth
  },
  "SNX": {
    name: "Synthetix",
    image: snx
  },
  "WBTC": {
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    name: "Wrapped Bitcoin",
    image: wbtc
  },
  "AMPL": {
    name: "Ampleforth",
    image: ampl
  },
  "UNI": {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    name: 'Uniswap',
    image: uni
  }
}

export const marketColumns = [
  { id: 'time', label: 'TIME', minWidth: 100 },
  {
    id: 'input',
    label: 'INPUT',
    minWidth: 125,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'type',
    label: 'TYPE',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'output',
    label: 'OUTPUT',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'tx',
    label: 'TRANSACTION',
    minWidth: 100,
    align: 'center'
  }
]

export const eventColumns = [
  { id: 'time', label: 'TIME', minWidth: 100 },
  {
    id: 'event',
    label: 'EVENT',
    minWidth: 125,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'tx',
    label: 'TRANSACTION',
    minWidth: 100,
    align: 'center'
  },
]

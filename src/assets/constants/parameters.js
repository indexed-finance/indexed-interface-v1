import React from 'react'
import Web3 from 'web3'

import eth from '../images/eth.png'
import mkr from '../images/mkr.png'
import dai from '../images/dai.png'
import wbtc from '../images/wbtc.png'
import comp from '../images/comp.png'
import busd from '../images/busd.png'
import knc from '../images/knc.png'
import link from '../images/link.png'
import ampl from '../images/ampl.png'
import bat from '../images/bat.png'
import bal from '../images/bal.png'
import snx from '../images/snx.png'
import yfi from '../images/yfi.png'
import usdt from '../images/usdt.png'
import crv from '../images/crv.png'
import usdc from '../images/usdc.png'
import uni from '../images/uni.png'

import { isNative } from './functions'

let currentTime = (new Date()).getHours()
let isNight = (currentTime > 20 || currentTime < 6)

export const initialState = {
  web3: {
    mainnet: new Web3('https://mainnet.infura.io/v3/1c6549e97ff24d9a99ba4e007b538de6'),
    rinkeby: new Web3('https://rinkeby.infura.io/v3/1c6549e97ff24d9a99ba4e007b538de6'),
    websocket: new Web3('wss://rinkeby.infura.io/ws/v3/1c6549e97ff24d9a99ba4e007b538de6'),
    injected: false
  },
  background: isNight ? '#111111' : '#ffffff',
  color: isNight ? '#ffffff' : '#333333',
  native: isNative({ width: null }),
  request: false,
  load: false,
  dark: isNight,
  categories: {},
  proposals: {
    dailyDistributionSnapshots: [],
    proposals: []
  },
  stats: {
    totalLocked: 0,
    dailyVolume: 0
  },
  width: 0,
  height: 0,
  modal: {
    show: false,
    title: null,
    message: null,
    messageCode: 0,
    actions: []
  },
  flag: {
    show: false,
    message: null,
    opcode: ''
  },
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
    'BAT': { amount: 0, address: null },
    'MKR': { amount: 0, address: null },
    'LINK': { amount: 0, address: null },
    'BUSD': { amount: 0, address: null },
    'UNI': { amount: 0, address: null },
    'CRV': { amount: 0, address: null },
    'BAL': { amount: 0, address: null },
    'KNC': { amount: 0, address: null },
    'NDX': { amount: 0, address: null },
    'WBTC': { amount: 0, address: null }
  },
  indexes: {},
  proposals: {}
}

export const tokenMetadata = {
  "BAT": {
    address: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    name: "Basic Attention Token",
    image: bat
  },
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
  "BAL": {
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    name: "Balancer",
    image: bal
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
  },
  "CRV": {
    address: '0xd533a949740bb3306d119cc777fa900ba034cd52',
    name: 'Curve',
    image: crv
  },
  "KNC": {
    address: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
    name: 'Kyber Network',
    image: knc
  }
}

export const marketColumns = [
  { id: 'time', label: 'TIME', minWidth: 50 },
  {
    id: 'input',
    label: 'INPUT',
    minWidth: 100,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'type',
    label: 'TYPE',
    minWidth: 25,
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
    minWidth: 75,
    align: 'center'
  }
]

export const eventColumns = [
  {
    id: 'blockNumber',
    label: 'BLOCK',
    align: 'left',
    minWidth: 75,
    // format: (unixtime) => {
    //   const newDate = new Date();
    //   newDate.setTime(unixtime*1000);
    //   return newDate.toUTCString();
    // }
  },
  {
    id: 'event',
    label: 'AMOUNT',
    minWidth: 175,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'type',
    label: 'TYPE',
    minWidth: 50,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'tx',
    label: 'TRANSACTION',
    minWidth: 75,
    align: 'center'
  },
]

export const DESKTOP_MASSIVE = 3750
export const DESKTOP_HUGE = 2750
export const DESKTOP_WIDE = 2749
export const DESKTOP_LARGE = 1920
export const DESKTOP_NORMAL = 1600
export const DESKTOP_SMALL = 1440
export const NATIVE_WIDE = 400
export const NATIVE_NORMAL = 399
export const NATIVE_SMALL = 320

export const TX_CONFIRM = { show: true, message: 'TRANSACTION CONFIRMED', opcode: 'success' }
export const TX_REVERT = { show: true, message: 'TRANSACTION REVERTED', opcode: 'error' }
export const WEB3_PROVIDER = { show: true, message: 'NO WEB3 PROVIDER DETECTED', opcode: 'info' }

const toFlagDispatch = (payload) => ({ type: 'FLAG', payload });
const txEtherscanProps = (txHash, network = 'rinkeby') => ({ type: 'tx', entity: txHash, network });

export const TX_PENDING = (txHash, network = 'rinkeby') => toFlagDispatch({
  show: true,
  message: 'TRANSACTION PENDING',
  opcode: 'info',
  etherscan: txEtherscanProps(txHash, network)
});
export const TX_CONFIRMED = (txHash, network = 'rinkeby') => toFlagDispatch({ ...TX_CONFIRM, etherscan: txEtherscanProps(txHash, network) });
export const TX_REVERTED = (txHash, network = 'rinkeby') => toFlagDispatch({ ...TX_REVERT, etherscan: txEtherscanProps(txHash, network) });
export const NO_PROVIDER = toFlagDispatch(WEB3_PROVIDER);

export const MARKET_ORDER = (input, output, f) => ({
  show: true,
  title: 'CONFIRM ORDER',
  message: `You are about to swap ${input.amount} ${input.market} for ${output.amount} ${output.market}.`,
  actions: [{ label: 'CONFIRM', f: f }, { label: 'REJECT', f: null }]
})
export const UNCLAIMED_CREDITS = (f) => ({
  show: true,
  title: 'UNCLAIMED CREDITS',
  message: `You have unclaimed compensation for this pool, would you like to redeem your share?`,
  actions: [{ label: 'CONFIRM', f: f }, { label: 'REJECT', f: null }]
})
export const INCORRECT_NETWORK = { show: true, title: 'INCORRECT NETWORK', message: 'The current network is not supported please change to Rinkeby testnet.', actions: [ ] }

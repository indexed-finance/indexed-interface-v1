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
  dark: isNight,
  categories: {},
  account: null,
  network: null,
  indexes: {}
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
    name: "Wrapped Bitcoin",
    image: wbtc
  },
  "AMPL": {
    name: "Ampleforth",
    image: ampl
  },
}

export const marketColumns = [
  { id: 'time', label: 'TIME', minWidth: 100 },
  {
    id: 'price',
    label: 'PRICE',
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
    id: 'amount',
    label: 'AMOUNT',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'transaction',
    label: 'TRANSACTION',
    minWidth: 100,
    align: 'center'
  }
]

export const rebalanceColumns = [
  { id: 'time', label: 'TIME', minWidth: 100 },
  {
    id: 'input',
    label: 'TRADE IN',
    minWidth: 125,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'output',
    label: 'TRADE OUT',
    minWidth: 125,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'transaction',
    label: 'TRANSACTION',
    minWidth: 100,
    align: 'center'
  },
  {
    id: 'fee',
    label: 'Fee',
    minWidth: 75,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
]

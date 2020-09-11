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

export const initialState = {
  web3: new Web3('https://mainnet.infura.io/v3/1c6549e97ff24d9a99ba4e007b538de6'),
  account: null,
  network: null,
  request: false,
  indexes: {}
}

export const tokenMapping = {
  "0xeabcaa888fcdd99871dd26823f8df7b0be304e09": {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    name: "USD Coin",
    symbol: "USDC"
  },
  "0x50b2e1a8d4b92509b1c98d0125d5638ea7509541": {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    name: "Tether",
    symbol: "USDT"
  },
  "0x7fc814f19a8b6416c666a67d8b0bfc9998ea352c": {
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    name: "Binance USD",
    symbol: "BUSD"
  },
  "0xd5ae7bee0a3505ff10ce26952770ee44872f9335": {
    address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    name: "Compound",
    symbol: "COMP"
  },
  "0x76cd51ab56b0980c03a2d833253b6e1cefc12e50": {
    address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    name: "Yearn",
    symbol: "YFI"
  },
  "0x865a907b41809ee66aa6b09dce99b4257c986e75": {
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    name: "Maker",
    symbol: "MKR"
  },
  "0xd1175b329af2a9471006bf7bbb8710b0a04a90a8": {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    name: "Dai Stablecoin",
    symbol: "DAI",
  },
  "0x0b401f3b84a84ef29b75a540cbf7443597558c21": {
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    name: "Chainlink",
    symbol: "LINK"
  }
}

export const tokenImages = {
  'USDC': usdc,
  'USDT': usdt,
  'BUSD': busd,
  'AMPL': ampl,
  'ETH': eth,
  'COMP': comp,
  'SNX': snx,
  'WBTC': wbtc,
  'LINK': link,
  'DAI': dai,
  'YFI': yfi,
  'MKR': mkr
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

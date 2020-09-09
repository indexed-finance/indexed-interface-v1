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
  "0x1d670711eb571f1607e289e6466639c149a0d020": {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6
  },
  "0x04844e88c17917dabbe6ca8972cf73455bd26962": {
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    name: "Tether",
    symbol: "USDT",
    decimals: 6
  },
  "0xa7cde04e62874ce7b7700de537386fcf145ca728": {
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    name: "Binance USD",
    symbol: "BUSD",
    decimals: 18
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

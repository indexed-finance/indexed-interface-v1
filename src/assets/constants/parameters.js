import React from 'react'

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
  account: null,
  network: null,
  web3: null,
}

export const tokenMapping = {
  "0x1d670711eb571f1607e289e6466639c149a0d020": {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6
  },
  "0x04844e88c17917dabbe6ca8972cf73455bd26962": {
    name: "Tether",
    symbol: "USDT",
    decimals: 6
  },
  "0xa7cde04e62874ce7b7700de537386fcf145ca728": {
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

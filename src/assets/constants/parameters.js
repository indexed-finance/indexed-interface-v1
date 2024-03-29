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
import aave from '../images/aave.png'
import zrx from '../images/zrx.png'
import uma from '../images/uma.png'
import omg from '../images/omg.png'
import ren from '../images/ren.png'
import ccLight from '../images/cc-light.png'
import ccDark from '../images/cc-dark.png'
import defiLight from '../images/defi-light.png'
import defiDark from '../images/defi-dark.png'
import defiDarkCircular from '../images/defi-dark-circular.png'
import defiLightCircular from '../images/defi-light-circular.png'
import ccDarkCircular from '../images/cc-dark-circular.png'
import ccLightCircular from '../images/cc-light-circular.png'
import orclDarkCircular from '../images/orcl-dark-circular.png'
import orclLightCircular from '../images/orcl-light-circular.png'
import degenLightCircular from '../images/degen-light-circular.png';
import nftpLightCircular from '../images/nftp-light-circular.png';
import nftpDarkCircular from '../images/nftp-dark-circular.png';
import errorDarkCircular from '../images/error-dark-circular.png';
import errorLightCircular from '../images/error-light-circular.png';
import fffDarkCircular from '../images/fff-dark-circular.png'
import fffLightCircular from '../images/fff-light-circular.png'

import { isNative } from './functions'

let dark = localStorage.getItem('dark');
if (dark === null) {
  let currentTime = (new Date()).getHours()
  let isNight = (currentTime >= 17 || currentTime < 6)
  dark = isNight;
} else {
  dark = JSON.parse(dark);
}

const rinkebyWhitelist = require('./whitelists/rinkeby-tokens.json');
const mainnetWhitelist = require('./whitelists/limited-mainnet-tokens.json');

export const whitelistTokens = process.env.REACT_APP_ETH_NETWORK == 'rinkeby'
  ? rinkebyWhitelist
  : mainnetWhitelist;

export function getTokenImage(token) {
  const imageBaseUrl = `https://tokens.1inch.exchange/`;
  let address;
  if (typeof token == 'string') {
    address = token;
  }
  if (process.env.REACT_APP_ETH_NETWORK == 'rinkeby') {
    address = token.mainnetAddress;
  } else {
    address = token.address;
  }
  return `${imageBaseUrl}${address?.toLowerCase()}.png`;
}

export const initialState = {
  web3: {
    mainnet: process.env.REACT_APP_ETH_NETWORK === 'mainnet' ? new Web3('https://mainnet.infura.io/v3/442bad44b92344b7b5294e4329190fea') : null,
    rinkeby: process.env.REACT_APP_ETH_NETWORK === 'rinkeby' ? new Web3('https://rinkeby.infura.io/v3/442bad44b92344b7b5294e4329190fea') : null,
    injected: false
  },
  didLoadHelper: false,
  helper: null,
  background: dark ? '#111111' : '#ffffff',
  color: dark ? '#ffffff' : '#333333',
  native: isNative({ width: null }),
  request: false,
  load: false,
  dark: dark,
  categories: {},
  governance: {
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
  balances: {
    'NDX': 0
  },
  flag: {
    show: false,
    message: null,
    opcode: ''
  },
  account: null,
  network: null,
  indexes: {},
  proposals: {}
}

export const initialPoolState = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    liquidity: [],
    category: null,
    volume: '',
    active: null,
    credit: 0,
    history: [],
    type: <span> &nbsp;&nbsp;&nbsp;&nbsp;</span>
};

export const initialProposalState = {
   title: null,
   description: null,
   votes: [],
   for: 0,
   against: 0,
   state: 0,
   action: null,
   expiry: 0,
   proposer: '0x0000000000000000000000000000000000000000',
   targets: [],
   calldatas: [],
   signatures: []
 }

// Image size formatting over-ride w/ IMAGE_INLINE_SIZE_LIMIT
// be weary of it causing future trouble w/images

export const categoryMetadata = {
  '0x1': {
    normal: {
      light: ccLight,
      dark: ccDark
    },
    circular: {
      light: ccLightCircular,
      dark: ccDarkCircular
    }
  },
  '0x2': {
    normal: {
      light: defiLight,
      dark: defiDark
    },
    circular: {
      light: defiDarkCircular,
      dark: defiLightCircular
    }
  },
  '0x3': {
    normal: {
      light: orclLightCircular,
      dark: orclDarkCircular
    },
    circular: {
      light: orclLightCircular,
      dark: orclDarkCircular
    }
  },
  'sigma-v10x1': {
    normal: {
      light: degenLightCircular,
      dark: degenLightCircular,
    },
    circular: {
      light: degenLightCircular,
      dark: degenLightCircular
    }
  },
  'sigma-v10x2': {
    normal: {
      light: nftpLightCircular,
      dark: nftpDarkCircular
    },
    circular: {
      light: nftpLightCircular,
      dark: nftpDarkCircular
    }
  },
  'sigma-v10x3': {
    normal: {
      dark: errorDarkCircular,
      light: errorLightCircular
    },
    circular: {
      dark: errorDarkCircular,
      light: errorLightCircular
    }
  },
  'sigma-v10x4': {
    normal: {
      dark: fffDarkCircular,
      light: fffLightCircular
    },
    circular: {
      dark: fffDarkCircular,
      light: fffLightCircular
    }
  },
  null: {
    circular: {
      light: null,
      dark: null
    },
    normal: {
      light: null,
      dark: null
    }
  }
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
    name: "MakerDAO",
    image: mkr
  },
  "BAL": {
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    name: "Balancer",
    image: bal
  },
  "DAI": {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    name: "Dai",
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
  "ZRX": {
    name: "0x",
    image: zrx
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
  },
  "AAVE": {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    name: 'Aave',
    image: aave
  },
  "OMG": {
    address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
    name: 'OmiseGO',
    image: omg
  },
  "UMA": {
    address: "0x04fa0d235c4abf4bcf4787af4cf447de572ef828",
    name: "UMA",
    image: uma
  },
  "REN": {
    address: "0x408e41876cccdc0f92210600ef50372656052a38",
    name: "Republic",
    image: ren
  },
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
    minWidth: 15,
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

export const eventDesktopColumns = [
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

export const eventNativeColumns = [
  {
    id: 'event',
    label: 'AMOUNT',
    minWidth: 25,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'type',
    label: 'TYPE',
    minWidth: 25,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'tx',
    label: 'TRANSACTION',
    minWidth: 50,
    align: 'center'
  },
]

export const categoryDesktopColumns = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'size',
    label: 'SIZE',
    minWidth: 25,
    align: 'center',
    format: (value) => `${value.toLocaleString()}`,
  },
  {
    id: 'price',
    label: 'PRICE',
    minWidth: 75,
    align: 'center',
    format: (value) => `$${value.toLocaleString()}`,
  },
  {
    id: 'supply',
    label: 'SUPPLY',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString()}`,
  },
  {
    id: 'marketcap',
    label: 'MARKETCAP',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString()}`,
  },
  {
    id: 'swapFeeUSD',
    label: 'SWAP FEE',
    minWidth: 50,
    align: 'center',
    format: (value) => `%${value.pool.swapFeeUSD.toLocaleString()}`,
  },
  {
    id: 'feesTotalUSD',
    label: 'CUMULATIVE FEES',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.pool.feesTotalUSD.toLocaleString()}`,
  },
  {
    id: 'volume',
    label: 'VOLUME',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString()}`,
  },
]

export const categoryNativeColumns = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 25,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'size',
    label: 'SIZE',
    minWidth: 15,
    align: 'center',
    format: (value) => `${value.toLocaleString()}`,
  },
  {
    id: 'supply',
    label: 'SUPPLY',
    minWidth: 25,
    align: 'center',
    format: (value) => `${value.toLocaleString()}`,
  },
]


export const poolDesktopColumns = [
  { id: 'name', label: 'NAME', minWidth: 250 },
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 25 ,
    align: 'center',
    format: (value) => `[${value.toLocaleString('en-US')}]`,
  },
  {
    id: 'price',
    label: 'VALUE',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'delta',
    label: '24HR \u0394',
    minWidth: 25,
    align: 'center',
    format: (value) => `%${value.toLocaleString('en-US')}`,
  },
  {
    id: 'marketcap',
    label: 'MARKET CAP',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'volume',
    label: 'VOLUME',
    minWidth: 200,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

export const poolNativeColumns  = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 25 ,
    align: 'center',
    format: (value) => `[${value.toLocaleString('en-US')}]`,
  },
  {
    id: 'price',
    label: 'VALUE',
    minWidth: 50,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'delta',
    label: '24HR \u0394',
    minWidth: 25,
    align: 'center',
    format: (value) => `%${value.toLocaleString('en-US')}`,
  }
];

export const DESKTOP_MASSIVE = 3750
export const DESKTOP_HUGE = 2750
export const DESKTOP_WIDE = 2749
export const DESKTOP_LARGE = 1920
export const DESKTOP_NORMAL = 1600
export const DESKTOP_SMALL = 1440
export const NATIVE_WIDE = 400
export const NATIVE_NORMAL = 399
export const NATIVE_SMALL = 320

const PREFIX = window.innerWidth > 600 ? 'TRANSACTION' : 'TX'

export const TX_CONFIRM = { show: true, message: `${PREFIX} CONFIRMED`, opcode: 'success' }
export const TX_REVERT = { show: true, message:  `${PREFIX} REVERTED`, opcode: 'error' }
export const TX_REJECT = { show: true, message: `${PREFIX} REJECTED`, opcode: 'error' };
export const WEB3_PROVIDER = { show: true, message: 'NO PROVIDER DETECTED', opcode: 'info' }

const envNetwork = process.env.REACT_APP_ETH_NETWORK;

const toFlagDispatch = (payload) => ({ type: 'FLAG', payload });
const txEtherscanProps = (txHash, network = envNetwork) => ({ type: 'tx', entity: txHash, network });

export const TX_PENDING = (txHash, network = envNetwork) => toFlagDispatch({
  show: true,
  message: `${PREFIX} PENDING`,
  opcode: 'info',
  etherscan: txEtherscanProps(txHash, network)
});
export const TX_CONFIRMED = (txHash, network = envNetwork) => toFlagDispatch({ ...TX_CONFIRM, etherscan: txEtherscanProps(txHash, network) });
export const TX_REVERTED = (txHash, network = envNetwork) => toFlagDispatch({ ...TX_REVERT, etherscan: txEtherscanProps(txHash, network) });
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
  message: `You have unclaimed credits for this pool, would you like to redeem your share?`,
  actions: [{ label: 'CONFIRM', f: f }, { label: 'REJECT', f: null }]
})
export const INCORRECT_NETWORK = { show: true, title: 'INCORRECT NETWORK', message: `The current network is not supported, please change to your provider's network to ${envNetwork}.`, actions: [ ] }
export const DISCLAIMER = { show: true, title: 'DISCLAIMER', message: <>This project is in beta. Use it at your own risk, and do not put in more than you are prepared to lose.</>, actions: [ ] }

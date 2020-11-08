import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import { createMuiTheme, makeStyles, ThemeProvider, styled } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { getAllHelpers } from '@indexed-finance/indexed.js';

import IERC20 from './assets/constants/abi/IERC20.json'
import { StateProvider } from './state'
import Navigation from './components/navigation'
import Loader from './components/loader'
import Modal from './components/modal'
import Flag from './components/flag'

import { getTokenCategories, getTokenPriceHistory, getIndexPool, getETHPrice } from './api/gql'
import * as serviceWorker from './utils/serviceWorker'
import { tokenMetadata } from './assets/constants/parameters'
import { getIPFSFile } from './api/ipfs'
import { store } from './state'
import BN from 'bn.js'

import './assets/css/root.css'

const Governance = lazy(() => import('./routes/governance'))
const Categories = lazy(() => import('./routes/categories'))
const Proposal = lazy(() => import('./routes/proposal'))
const Propose = lazy(() => import('./routes/propose'))
const Markets = lazy(() => import('./routes/markets'))
const Index = lazy(() => import('./routes/index'))
const Pool = lazy(() => import('./routes/pool'))
const Stake = lazy(() => import('./routes/stake'))
const Supply = lazy(() => import('./routes/supply'))
const Root = lazy(() => import('./routes/root'))
const Error404 = lazy(() => import('./routes/404'))

const isNight = () => {
  let currentTime = (new Date()).getHours()
  return (currentTime > 20 || currentTime < 6)
}

const renameKeys = (keysMap, obj) =>
  obj.map(value =>
    Object.keys(value).reduce(
      (acc, key) => ({
        ...acc,
        ...{ [keysMap[key] || key]: value[key] }
      }),
    {}
  )
)

const replace = { priceUSD: 'close', date: 'date' }

const toBN = (bn) => {
  if (BN.isBN(bn)) return bn;
  if (bn._hex) return new BN(bn._hex.slice(2), 'hex');
  if (typeof bn == 'string' && bn.slice(0, 2) == '0x') {
    return new BN(bn.slice(2), 'hex');
  }
  return new BN(bn);
};

const oneToken = new BN('de0b6b3a7640000', 'hex')

function Main({ children }) {
  return children
}

const getTheme = condition => createMuiTheme({
  typography: {
    fontFamily: "San Francisco Bold",
  },
  palette: {
    text: {
      primary: !condition ? '#333333' : '#ffffff',
    },
    type: !condition ? 'light' : 'dark',
    primary: {
      main: !condition ? '#ffffff' : '#111111',
    },
    secondary: {
      main: !condition ? '#333333' : '#ffffff',
    },
    background: {
      default: !condition ? '#ffffff' : '#111111',
      paper: !condition ? '#ffffff' : '#111111',
    }
  }
});

function Application(){
  let { state, dispatch } = useContext(store)
  let { dark } = state

  const [ theme, setTheme ] = useState(getTheme(dark))
  const [ mode, setMode ] = useState(dark)

  const getTokenMetadata = async (id, array) => {
    let pool = await getIndexPool(id)

    for(let token in pool[0].tokens) {
     let asset = pool[0].tokens[token]
     let contract = new state.web3.rinkeby.eth.Contract(IERC20.abi, asset.token.id)
     let symbol = await contract.methods.symbol().call()

     if(!tokenMetadata[symbol]) {
       console.log(`UNKNOWN ASSET: ${symbol}, ADDRESS: ${asset.token.id}`)
     } else {
       let { name, address } = tokenMetadata[symbol]

       contract = new state.web3.mainnet.eth.Contract(IERC20.abi, address)
       let supply = await contract.methods.totalSupply().call()
          .then((supply) => supply/Math.pow(10, 18))
       let decimals = parseInt(await contract.methods.decimals().call())
       let history = await getTokenPriceHistory(address, 30)

       let [{ priceUSD }] = history

       array.push({
         weight: parseInt(asset.denorm)/parseInt(pool[0].totalWeight),
         desired: parseInt(asset.desiredDenorm)/Math.pow(10, 18),
         balance: parseInt(asset.balance)/Math.pow(10, 18),
         history: renameKeys(replace, history).reverse(),
         marketcap: supply * priceUSD,
         name: name.toUpperCase(),
         address: asset.token.id,
         price: priceUSD,
         symbol: symbol,
         decimals
       })
      }
    }
    return array
  }

  const changeTheme = (isDark) => {
    let modeChange = isDark ? false : true
    let background = modeChange ? '#111111' : '#ffffff'
    let color = modeChange ? '#ffffff' : '#333333'

    setBackground(background, color)
    setTheme(getTheme(modeChange))
    setMode(modeChange)
  }

  const setBackground = (background, color) => {
    document.body.style.background = background
    document.body.style.color = color
  }

const onResize = () => {
  console.log('RESIZE FIRED')
  dispatch({
    type: 'RESIZE',
    payload: {
      height: window.innerHeight,
      width: window.innerWidth
    }
  })
}

  useEffect(() => {
    const retrieveCategories = async(indexes, categories) => {
      let tokenCategories = await getTokenCategories()
      let ethUSD = await getETHPrice()

      for(let category in tokenCategories) {
        let { id, metadataHash, indexPools } = tokenCategories[category]
        let { name, symbol } = await getIPFSFile(metadataHash)
        let tokenCategoryId = id

        if(!categories[symbol]){
          categories[tokenCategoryId] = { indexes: [], symbol, name }
        }

        for(let index in indexPools) {
          let { id, totalSupply, size } = indexPools[index]
          let indexAddress = id

          let tokens = await getTokenMetadata(id, [])
          var value = tokens.reduce((a, b) => a + b.balance * b.price, 0)
          var supply = totalSupply/Math.pow(10, 18)
          let ticker = `${symbol}I${size}`
          var price = (value/supply)
          let active = true
          let history = []
          let change = 0

          try {
            tokens[0].history.map((meta, index) =>
              history.push({
                close: ((meta.close * tokens[0].balance) +
                  tokens.slice(1).reduce((a, b, i) => a + b.balance * b.history[i].close, 0)
                )/supply,
                date: meta.date * 1000
              })
            )
            change = price/history[history.length-2].close
          } catch (e) {
            active = false
          }

          categories[tokenCategoryId].indexes.push(ticker)
          indexes[ticker] = {
            tokens: tokens.map(token => token.symbol).join(', '),
            marketcap: `$${value.toLocaleString()}`,
            price: `$${price.toLocaleString()}`,
            delta: `${(change - 1).toFixed(4)}%`,
            supply: supply.toLocaleString(),
            category: tokenCategoryId,
            name: name.toUpperCase(),
            address: indexAddress,
            history: history,
            assets: tokens,
            symbol: ticker,
            active
          }
        }
      }
      await dispatch({ type: 'GENERIC',
        payload: {
          request: true , categories, indexes, ...ethUSD
        }
      })
    }
    retrieveCategories({}, {})
  }, [ state.load ])

  useEffect(() => {
    const initialise = async() => {
      let { background, color, web3 } = state

      setBackground(background, color)
      onResize()

      window.addEventListener("resize", onResize)
      let helper = state.helper ? state.helper : await getAllHelpers(web3.rinkeby)
      dispatch({ type: 'GENERIC', payload: { changeTheme, helper } })
    }
    initialise()
  }, [ ])

    return(
    <ThemeProvider theme={theme}>
      <Router>
        <Navigation mode={mode}/>
          <Main>
            <Suspense fallback={<Loader />}>
              <Switch>
                <Route path='/proposal/:id'>
                  <Proposal />
                </Route>
                <Route path='/index/:name'>
                  <Index />
                </Route>
                <Route path='/propose'>
                  <Propose />
                </Route>
                <Route path='/pool/:address'>
                  <Pool />
                </Route>
                <Route path='/categories'>
                  <Categories />
                </Route>
                <Route exact path='/stake'>
                  <Stake />
                </Route>
                <Route path='/stake/:asset'>
                  <Supply />
                </Route>
                <Route path='/markets'>
                  <Markets />
                </Route>
                <Route exact path='/'>
                  <Root />
                </Route>
                <Route path='/governance'>
                  <Governance />
                </Route>
                <Route>
                  <Error404 />
                </Route>
              </Switch>
            </Suspense>
            <Modal />
            <Flag />
          </Main>
       </Router>
    </ThemeProvider>
    )
}

ReactDOM.render(
  <StateProvider> <Application /> </StateProvider>,
  document.getElementById('root')
)

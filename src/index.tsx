import React, { useContext, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './utils/serviceWorker'
import { StateProvider } from './state'
import BN from 'bn.js'

import Navigation from './components/navigation'
import Governance from './routes/governance'
import Categories from './routes/categories'
import Proposal from './routes/proposal'
import Propose from './routes/propose'
import Markets from './routes/markets'
import Index from './routes/index'
import Root from './routes/root'
import Pools from './routes/pools'
import Pool from './routes/pool'

import { getTokenCategories, getTokenPriceHistory, getIndexPool } from './api/gql'
import IERC20 from './assets/constants/abi/IERC20.json'
import { tokenMetadata } from './assets/constants/parameters'
import { store } from './state'

import './assets/css/root.css'

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

const isNight = () => {
  let currentTime = (new Date()).getHours()
  return (currentTime > 20 || currentTime < 6)
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

  useEffect(() => {
    const retrieveCategories = async(indexes, categories) => {
      let tokenCategories = await getTokenCategories()

      for(let category in tokenCategories) {
        let { id, name, symbol, indexPools } = tokenCategories[category]
        let tokenCategoryId = id

        name = name.toUpperCase()

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
          let history = []

          tokens[0].history.map((meta, index) =>
            history.push({
              close: ((meta.close * tokens[0].balance) +
                tokens.slice(1).reduce((a, b) => a + b.balance * b.history[index].close , 0)
              )/supply,
              date: meta.date * 1000
            })
          )

          var change = price/history[history.length-2].close

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
          }
        }
      }
      await dispatch({ type: 'INIT',
        payload: { categories, indexes, changeTheme  }
      })
    }
    setBackground(state.background, state.color)
    retrieveCategories({}, {})
  }, [ ])


  return(
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path='/proposal/:id'>
            <Navigation mode={mode}/>
            <Proposal />
          </Route>
          <Route path='/index/:name'>
            <Navigation mode={mode}/>
            <Index />
          </Route>
          <Route path='/propose'>
            <Navigation mode={mode}/>
            <Propose />
          </Route>
          <Route path='/pool/:address'>
            <Navigation mode={mode}/>
            <Pool />
          </Route>
          <Route path='/pools'>
            <Navigation mode={mode}/>
            <Pools />
          </Route>
          <Route path='/categories'>
            <Navigation mode={mode}/>
            <Categories />
          </Route>
          <Route path='/markets'>
            <Navigation mode={mode}/>
            <Markets />
          </Route>
          <Route exact path='/'>
            <Root />
          </Route>
          <Route path='/governance'>
            <Navigation mode={mode}/>
            <Governance />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

ReactDOM.render(
  <StateProvider> <Application /> </StateProvider>,
  document.getElementById('root')
)

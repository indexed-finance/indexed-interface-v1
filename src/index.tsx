import React, { useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './utils/serviceWorker'
import { StateProvider } from './state'
import BN from 'bn.js'

import Navigation from './components/navigation'
import Categories from './routes/categories'
import Markets from './routes/markets'
import Index from './routes/index'
import Root from './routes/root'
import Demo from './routes/demo'

import { getTokenCategories, getTokenPriceHistory, getIndexPool } from './api/gql'
import IERC20 from './assets/constants/abi/IERC20.json'
import { tokenMapping } from './assets/constants/parameters'
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

 const toBN = (bn) => {
  if (BN.isBN(bn)) return bn;
  if (bn._hex) return new BN(bn._hex.slice(2), 'hex');
  if (typeof bn == 'string' && bn.slice(0, 2) == '0x') {
    return new BN(bn.slice(2), 'hex');
  }
  return new BN(bn);
};

const oneToken = new BN('de0b6b3a7640000', 'hex')

const theme = createMuiTheme({
  typography: {
    fontFamily: "San Francisco Bold",
  },
  palette: {
    primary: {
      main: '#333333',
    },
    secondary: {
      main: '#999999',
    },
  }
});

function Application(){
  let { state, dispatch } = useContext(store)

  const getTokenMetadata = async (id, array) => {
    let pool = await getIndexPool(id)

    for(let token in pool[0].tokens) {
     let asset = pool[0].tokens[token]
     console.log(asset.token.id)

     let { name, symbol, decimals, address } = tokenMapping[asset.token.id]
     let replace = { priceUSD: 'close', date: 'date' }

     console.log(symbol)

     const contract = new state.web3.eth.Contract(IERC20, address)
     let supply = await contract.methods.totalSupply().call()
        .then((supply) => supply/Math.pow(10, 18))

     let history = await getTokenPriceHistory(address, 28)
     let [{ priceUSD }] = history

     array.push({
       weight: parseInt(asset.denorm)/parseInt(pool[0].totalWeight),
       balance: parseInt(asset.balance)/Math.pow(10, 18),
       history: renameKeys(replace, history).reverse(),
       marketcap: supply * priceUSD,
       address: address,
       price: priceUSD,
       symbol: symbol,
       name: name.toUpperCase()
     })
    }
    return array
  }

  useEffect(() => {
    const retrieveCategories = async(indexes) => {
      let tokenCategories = await getTokenCategories()

      for(let category in tokenCategories) {
        let { id, name, symbol, indexPools } = tokenCategories[category]

        for(let index in indexPools) {
          let { id, totalSupply, size } = indexPools[index]
          let tokens = await getTokenMetadata(id, [])
          var value = tokens.reduce((a, b) => a + b.balance * b.price, 0)
          var supply = totalSupply/Math.pow(10, 18)
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

          indexes[`${symbol}I${size}`] = {
            symbol: `${symbol}I${size}`,
            name: tokenCategories[category].name.toUpperCase(),
            category: tokenCategories[category].id,
            marketcap: `$${value.toLocaleString()}`,
            price: `$${price.toLocaleString()}`,
            delta: `${(change - 1).toFixed(4)}%`,
            supply: supply.toLocaleString(),
            history: history,
            assets: tokens,
            address: id
          }
        }
      }
      await dispatch({ type: 'INIT', payload: { indexes } })
    }
    retrieveCategories({})
  }, [ ])

  return(
    <Router>
      <Switch>
        <Route path='/index/:name'>
          <Navigation />
          <Index />
        </Route>
        <Route path='/categories'>
          <Navigation />
          <Categories />
        </Route>
        <Route path='/markets'>
          <Navigation />
          <Markets />
        </Route>
        <Route exact path='/'>
          <Root />
        </Route>
        <Route path='/demo'>
          <Navigation />
          <Demo />
        </Route>
      </Switch>
    </Router>
  )
}

ReactDOM.render(
  <StateProvider>
    <ThemeProvider theme={theme}>
      <Application />
    </ThemeProvider>
  </StateProvider>,
document.getElementById('root'))

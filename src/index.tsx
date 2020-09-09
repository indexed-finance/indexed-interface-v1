import React, { useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import * as serviceWorker from './utils/serviceWorker'
import { StateProvider } from './state'

import Navigation from './components/navigation'
import Categories from './routes/categories'
import Index from './routes/index'
import Root from './routes/root'
import Demo from './routes/demo'

import { getTokenCategories, getTokenPriceHistory, getIndexPool } from './api/gql'
import { tokenMapping } from './assets/constants/parameters'
import { store } from './state'

import './assets/css/root.css'

const theme = createMuiTheme({
  typography: {
    fontFamily: "San Francisco Bold"
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

  useEffect(() => {
    const retrieveCategories = async() => {
      let tokenCategories = await getTokenCategories()
      let indexes = []

      for(let category in tokenCategories) {
        let { id, name, symbol, indexPools } = tokenCategories[category]

        for(let index in indexPools) {
          let { id, totalSupply, size } = indexPools[index]
          let pool = await getIndexPool(id)

          indexes.push({
            category: tokenCategories[category].id,
            supply: parseInt(totalSupply)/Math.pow(10, 18),
            tokens: pool[0].tokens.map(asset => {
              let { symbol, decimals } = tokenMapping[asset.token.id]

              return {
                weight: parseInt(asset.denorm)/parseInt(pool[0].totalWeight),
                balance: parseInt(asset.balance)/Math.pow(10, decimals),
                address: asset.token.id,
                symbol: symbol
               }
            }),
            symbol: `${symbol}I${size}`,
            address: id,
            size: size,
          })
        }
      }

      dispatch({
        type: 'INIT', payload: { indexes }
      })
    }
    retrieveCategories()
  }, [ ])

  return(
    <Router>
      <Navigation />
      <Switch>
        <Route path='/index/:name'>
          <Index />
        </Route>
        <Route path='/categories'>
          <Categories />
        </Route>
        <Route exact path='/'>
          <Root />
        </Route>
        <Route path='/demo'>
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

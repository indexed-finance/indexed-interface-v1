import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import { createMuiTheme, ThemeProvider, styled } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { getAllHelpers, toTokenAmount, formatBalance } from '@indexed-finance/indexed.js';

import { StateProvider } from './state'
import Navigation from './components/navigation'
import Loader from './components/loader'
import Modal from './components/modal'
import Flag from './components/flag'

import { getCategoryMetadata } from './api/gql'
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
    const retrieveCategories = async() => {
      let categories = {};
      let indexes = {};
      // let tokenCategories = await getTokenCategories()
      if (!state.helper) return;
      const addCategory = async (categoryID) => {
        if (categories[categoryID]) {
          return;
        } else {
          const { name, symbol, description } = await getCategoryMetadata(+categoryID);
          categories[categoryID] = { name, symbol, description, indexes: [] };
        }
      };

      for (let pool of state.helper.initialized) {
        const { category, name, symbol, address, tokens } = pool;
        const categoryID = `0x${category.toString(16)}`;
        await addCategory(categoryID);
        let history = await pool.getSnapshots(90);

        console.log(history)

        const delta24hr = history.length === 1 ? 1 : (Math.abs(history[0].value - history[1].value) / history[1].value).toFixed(4);
        const ticker = symbol.toUpperCase();
        let supply = pool.pool.totalSupply;
        if (typeof supply !== 'number' && typeof supply != 'string') {
          supply = formatBalance(supply, 18, 4);
        }
        let volume = +(history[0].dailySwapVolumeUSD).toFixed(2);
        history = history.map(h => ({ close: +(h.value.toFixed(4)), date: new Date(h.date * 1000) }));
        const price = history[0].close;
        const index = {
          marketcap: (+pool.pool.totalValueLockedUSD).toFixed(2),
          price,
          delta: delta24hr,
          supply,
          category,
          name,
          symbol: ticker,
          size: pool.pool.size,
          address,
          history,
          assets: tokens,
          tokens: tokens.map(token => token.symbol).join(', '),
          active: true,
          poolHelper: pool,
          volume
        };
        categories[categoryID].indexes.push(ticker);
        indexes[ticker] = index;
      }
      for (let pool of state.helper.uninitialized) {
        const { category, name, symbol, address, tokens } = pool;
        const categoryID = `0x${category.toString(16)}`;
        await addCategory(categoryID);
        const ticker = symbol.toUpperCase();
        const index = {
          marketcap: 0,
          price: 0,
          delta: 0,
          supply: 0,
          category,
          name,
          size: pool.pool.size,
          symbol: ticker,
          address,
          history: [],
          assets: tokens,
          tokens: tokens.map(token => token.symbol).join(', '),
          active: false,
          poolHelper: pool,
          volume: 0
        };
        categories[categoryID].indexes.push(ticker);
        indexes[ticker] = index;
      }
      await dispatch({
        type: 'GENERIC',
        payload: {
          request: true , categories, indexes, /* ...ethUSD */
        }
      })
    }
    retrieveCategories()
  }, [ state.load, state.helper, dispatch ])

  useEffect(() => {
    const initialise = async() => {
      let { background, color, web3 } = state

      setBackground(background, color)
      onResize()
      window.addEventListener("resize", onResize)
      let account = state.account;
      let helper = state.helper ? state.helper : await getAllHelpers(web3.rinkeby, account);
      dispatch({ type: 'GENERIC', payload: { changeTheme, helper } })
    }
    initialise()
  }, [])

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

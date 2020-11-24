import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {  Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { getAllHelpers, formatBalance, BigNumber } from '@indexed-finance/indexed.js';

import { StateProvider } from './state'
import Navigation from './components/navigation'
import Loader from './components/loader'
import Modal from './components/modal'
import Flag from './components/flag'

import { getCategoryMetadata, getProposals } from './api/gql'
import { store } from './state'

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
    let { innerHeight, innerWidth } = window

    dispatch({
      type: 'RESIZE',
      payload: {
          height: innerHeight,
          width: innerWidth
       }
    })
  }

  useEffect(() => {
    const retrieveCategories = async() => {
      let stats = { dailyVolume: 0, totalLocked: 0 };
      let proposals = { ...await getProposals() };
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
        let snapshots = await pool.getSnapshots(90);

        const delta24hr = snapshots.length === 1 ? 1 : (Math.abs(snapshots[0].value - snapshots[1].value) / snapshots[1].value).toFixed(4);
        let supply = pool.pool.totalSupply;
        if (typeof supply !== 'number' && typeof supply != 'string') {
          supply = formatBalance(supply, 18, 4);
        }
        let volume = +(snapshots[0].dailySwapVolumeUSD).toFixed(2);
        let history = snapshots.map(h => ({ close: +(h.value.toFixed(4)), date: new Date(h.date * 1000) }));
        let liquidity = snapshots.map(l => ({ close: +(l.totalValueLockedUSD).toFixed(4), date: new Date(l.date * 1000) }))

        stats.totalLocked += parseFloat(pool.pool.totalValueLockedUSD)
        stats.dailyVolume += parseFloat(snapshots[0].dailySwapVolumeUSD)

        const price = parseFloat(history[0].close);
        const index = {
          marketcap: parseFloat((+pool.pool.totalValueLockedUSD).toFixed(2)),
          price,
          delta: delta24hr,
          supply,
          category,
          name,
          symbol,
          size: pool.pool.size,
          address,
          history,
          assets: tokens,
          tokens: tokens.map(token => token.symbol).join(', '),
          liquidity,
          active: true,
          poolHelper: pool,
          volume
        };
        categories[categoryID].indexes.push(symbol);
        indexes[symbol] = index;
      }
      for (let pool of state.helper.uninitialized) {
        await pool.update();
        const { category, name, symbol, address, tokens } = pool;
        const categoryID = `0x${category.toString(16)}`;
        await addCategory(categoryID);
        let finalValueEstimate = new BigNumber(0);
        let currentValue = new BigNumber(0);
        tokens.forEach((token) => {
          const price = pool.tokenPrices[token.address];
          currentValue = currentValue.plus(price.times(token.balance));
          finalValueEstimate = finalValueEstimate.plus(price.times(token.targetBalance));
        });

        const index = {
          marketcap: 0,
          price: 0,
          delta: 0,
          supply: 0,
          category,
          name,
          size: pool.pool.size,
          symbol,
          address,
          history: [],
          assets: tokens,
          tokens: tokens.map(token => token.symbol).join(', '),
          active: false,
          poolHelper: pool,
          volume: 0,
          currentValue: formatBalance(currentValue, 18, 4),
          finalValueEstimate: formatBalance(finalValueEstimate, 18, 4)
        };
        categories[categoryID].indexes.push(symbol);
        indexes[symbol] = index;
      }
      await dispatch({
        type: 'GENERIC',
        payload: {
          request: true , proposals, stats, categories, indexes,
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

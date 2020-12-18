import React, { useContext, useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { getAllHelpers, formatBalance, BigNumber } from '@indexed-finance/indexed.js';

import { StateProvider } from './state'
import Navigation from './components/navigation'
import Footer from './components/footer'
import Loader from './components/loader'
import Modal from './components/modal'
import Flag from './components/flag'

import { DISCLAIMER } from './assets/constants/parameters'

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
const Swap = lazy(() => import('./routes/swap'))
const Stake = lazy(() => import('./routes/stake'))
const Supply = lazy(() => import('./routes/supply'))
// const Root = lazy(() => import('./routes/root'))
const Error404 = lazy(() => import('./routes/404'))
const Category = lazy(() => import('./routes/category'))

const clearTimeDiscrepancies = date => {
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

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
      let categories = {};
      let indexes = {};
      let proposals = {}

      // let tokenCategories = await getTokenCategories()

      if (!state.helper || state.request) return;
      const addCategory = async (categoryID) => {
        if (categories[categoryID]) {
          return;
        } else {
          const id = `0x${(+categoryID).toString(16)}`;
          const { name, symbol, description } = require(`./assets/constants/categories/${id}.json`)
          categories[categoryID] = { name, symbol, description, indexes: [] };
        }
      };

      async function setProposals() {
        proposals = { ...await getProposals() };
      }

      async function setInitializedPools() {
        for (let pool of state.helper.initialized) {
          const { category, name, symbol, address, tokens } = pool;

          let snapshots = await pool.getSnapshots(90);
          let timestamp = new Date(Date.now())
          let categoryID = `0x${category.toString(16)}`;

          await addCategory(categoryID);

          let supply = pool.pool.totalSupply;
          if (typeof supply !== 'number' && typeof supply != 'string') {
            supply = formatBalance(supply, 18, 4);
          }
          let target = clearTimeDiscrepancies(new Date(timestamp.getTime() - 86400000));
          let history = snapshots.map(h => ({ close: +(h.value.toFixed(4)), date: new Date(h.date * 1000) }));
          let liquidity = snapshots.map(l => ({ close: +(l.totalValueLockedUSD).toFixed(4), date: new Date(l.date * 1000) }))
          let past24h = snapshots.find((i) => (i.date * 1000) === target.getTime())


          if(past24h === undefined) past24h = snapshots[snapshots.length-2];

          let delta24hr = snapshots.length === 1 ? 0 : (((snapshots[snapshots.length-1].value - past24h.value)/ past24h.value) * 100).toFixed(4);
          let volume = +(snapshots[snapshots.length-1].totalVolumeUSD).toFixed(2);

          stats.totalLocked += parseFloat(pool.pool.totalValueLockedUSD)
          stats.dailyVolume += volume

          let formattedName = name.replace(' Tokens', '')

          const price = parseFloat(history[history.length-1].close);
          const index = {
            marketcap: parseFloat((+pool.pool.totalValueLockedUSD).toFixed(2)),
            price,
            delta: delta24hr,
            supply,
            category,
            name: formattedName,
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
      }

      async function setUninitializedPools() {
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

          let formattedName = name.replace(' Tokens', '')

          const index = {
            marketcap: 0,
            price: 0,
            delta: 0,
            supply: 0,
            category,
            name: formattedName,
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

      }

      await Promise.all([
        setProposals(),
        setInitializedPools(),
        setUninitializedPools()
      ])

      await dispatch({
        type: 'GENERIC',
        payload: {
          request: true , proposals, stats, categories, indexes,
        }
      })
    }
    if(!state.request) retrieveCategories()
  }, [ state.helper ])

  useEffect(() => {
    const initialise = async() => {
      let { background, color, web3 } = state

      onResize()
      setBackground(background, color)
      window.addEventListener("resize", onResize)
      let helper = await getAllHelpers(web3[process.env.REACT_APP_ETH_NETWORK]);

      dispatch({ type: 'GENERIC', payload: { changeTheme, helper } })
    }
    initialise()
  }, [])

  useEffect(() => {
    let isFirstVisit = localStorage.getItem('isFirstVisit')

    if(isFirstVisit == null && state.request) {
      localStorage.setItem('isFirstVisit', '1')
      dispatch({
        type: 'MODAL',
        payload: DISCLAIMER
      })
    }
  }, [ state.request ])

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
                <Route path='/category/:id'>
                  <Category />
                </Route>
                <Route exact path='/stake'>
                  <Stake />
                </Route>
                <Route path='/stake/:asset'>
                  <Supply />
                </Route>
                <Route path='/swap'>
                  <Swap />
                </Route>
                <Route exact path='/'>
                  <Markets />
                </Route>
                <Route path='/governance'>
                  <Governance />
                </Route>
                <Route>
                  <Error404 />
                </Route>
              </Switch>
            </Suspense>
            <Footer />
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

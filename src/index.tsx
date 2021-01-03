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
import { StakingContextProvider } from './state/staking/context';

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
    localStorage.setItem('dark', modeChange.toString());
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

      // let tokenCategories = await getTokenCategories()

      if (!state.helper || state.request) return;
      const addCategory = async (categoryID) => {
        if (categories[categoryID]) {
          return;
        } else {
          if (process.env.REACT_APP_ETH_NETWORK === 'mainnet') {
            const id = `0x${(+categoryID).toString(16)}`;
            const { name, symbol, description } = require(`./assets/constants/categories/${id}.json`)
            categories[categoryID] = { name, symbol, description, indexes: [] };
          } else {
            const { name, symbol, description } = await getCategoryMetadata(+categoryID);
            categories[categoryID] = { name, symbol, description, indexes: [] };
          }
        }
      };

      async function setProposals() {
        const { dailyDistributionSnapshots, proposals } = await getProposals();
        for (let proposal of proposals) {
          const { description } = proposal;
          let title = description.split('\n').find(l => l.includes('#'));

          if(title) proposal.title = title.replace('# ', '');
          else proposal.title = ''
        }
        dispatch({ type: 'GENERIC', payload: { governance: { proposals, dailyDistributionSnapshots } } })
      }

      async function setInitializedPools() {
        for (let pool of state.helper.initialized) {
          const { category, name, symbol, address, tokens } = pool;

          let snapshots = pool.pool.snapshots;
          let timestamp = new Date(Date.now())
          let categoryID = `0x${category.toString(16)}`;

          await addCategory(categoryID);

          let supply = pool.pool.totalSupply;
          if (typeof supply !== 'number' && typeof supply != 'string') {
            supply = parseFloat(formatBalance(supply, 18, 2));
          }
          let history = snapshots.map(h => ({ close: +(h.value.toFixed(2)), date: new Date(h.date * 1000) }));
          let liquidity = snapshots.map(l => ({ close: +(l.totalValueLockedUSD).toFixed(2), date: new Date(l.date * 1000) }))

          snapshots.sort((a, b) => a.date - b.date);
          const latest = snapshots[snapshots.length - 1];
          const last24hr = snapshots.filter(s => s.date >= latest.date - 86400);
          const lastWeek = snapshots.filter(s => s.date >= latest.date - 604800);

          let volume24hr = last24hr.reduce((t, snap) => t + parseFloat(snap.totalVolumeUSD), 0);
          let volume = volume24hr.toFixed(2)

          stats.totalLocked += parseFloat(pool.pool.totalValueLockedUSD)
          stats.dailyVolume += parseFloat(volume);

          let formattedName = name.replace(/Tokens|Index/g, ' ')

          pool.pool.snapshots.sort((a, b) => a.date - b.date);

          let dayDelta = ((latest.value - last24hr[0].value) / last24hr[0].value) * 100;
          let weekDelta = ((latest.value - lastWeek[0].value) / lastWeek[0].value) * 100;

          let tvlDayDelta = ((latest.totalValueLockedUSD - last24hr[0].totalValueLockedUSD) / last24hr[0].totalValueLockedUSD) * 100;
          let tvlWeekDelta = ((latest.totalValueLockedUSD - lastWeek[0].totalValueLockedUSD) / lastWeek[0].totalValueLockedUSD) * 100;

          const price = parseFloat(latest.value.toFixed(2));
          const index = {
            marketcap: parseFloat((+latest.totalValueLockedUSD).toFixed(2)),
            price,
            delta: parseFloat(dayDelta.toFixed(2)),
            weekDelta: parseFloat(weekDelta.toFixed(2)),
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
            volume: stats.dailyVolume,
            tvlDayDelta: parseFloat(tvlDayDelta.toFixed(2)),
            tvlWeekDelta: parseFloat(tvlWeekDelta.toFixed(2))
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

          let formattedName = name.replace(/Tokens|Index/g, ' ')

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
        setInitializedPools(),
        setUninitializedPools()
      ]);
      setProposals();

      await dispatch({
        type: 'GENERIC',
        payload: {
          request: true, stats, categories, indexes,
        }
      })
    }
    if(!state.request) retrieveCategories()
  }, [ state.didLoadHelper ])

  useEffect(() => {
    const initialise = async() => {
      let { background, color, web3 } = state

      onResize()
      setBackground(background, color)
      window.addEventListener("resize", onResize)
      let helper = await getAllHelpers(web3[process.env.REACT_APP_ETH_NETWORK]);

      dispatch({ type: 'GENERIC', payload: { changeTheme, helper, didLoadHelper: true } })
    }
    initialise()
  }, [])

  useEffect(() => {
    const initialise = async() => {
      let { web3, account, helper } = state

      if(web3.injected){
        let helper = await getAllHelpers(web3.injected, account);

        dispatch({ type: 'GENERIC',
         payload: {
            didLoadHelper: true,
            helper
          }
        })
      }
    }
    initialise()
  }, [ state.web3.injected ])

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
  <StateProvider>
    <StakingContextProvider>
      <Application />
    </StakingContextProvider>
  </StateProvider>,
  document.getElementById('root')
)

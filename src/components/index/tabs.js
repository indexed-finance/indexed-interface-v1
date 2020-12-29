import React, {  useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Tabs from '@material-ui/core/Tabs'
import IconButton from '@material-ui/core/IconButton'
import Tab from '@material-ui/core/Tab'
import { Link } from 'react-router-dom'

import { formatBalance, BigNumber, toBN } from '@indexed-finance/indexed.js'
import ButtonSecondary from '../buttons/secondary'
import ButtonPrimary from '../buttons/primary'
import ButtonTransaction from '../buttons/transaction'
import Loader from '../loaders/tabs'
import WeightedToken from './weighted-token'
import List from '../list'

import style from '../../assets/css/components/tabs'
import etherscan from '../../assets/images/etherscan.png'
import uni from '../../assets/images/uni.png'
import { getPair } from '../../lib/markets'
import { getMarketTrades, getSwaps } from '../../api/gql'
import { store } from '../../state'
import getStyles from '../../assets/css'

import { marketColumns } from '../../assets/constants/parameters'
import { computeUniswapPairAddress } from '@indexed-finance/indexed.js/dist/utils/address'

const BN_ZERO = new BigNumber(0)

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  }
}


TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

const useStyles = getStyles(style)

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles()

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={classes.box} sp={index == 0 ? 3 : 0}>
          {children}
        </Box>
      )}
    </div>
  )
}

const dummy = { tokens: [], pool: { feesTotalUSD: 0,  swapFee: BN_ZERO, size: 0 }}

const swapsColumns = marketColumns.filter((i) => i.id !== 'type')

export default function VerticalTabs({ data }) {
  const [ trades, setTrades ] = useState([])
  const [ swaps, setSwaps ] = useState([])
  const [ value, setValue ] = useState(0)
  const [ meta, setMeta ] = useState(dummy)
  const classes = useStyles()
  const [helper, setHelper] = useState(undefined);

  let { state } = useContext(store);

  useEffect(() => {
    const setPool = async() => {
      let poolHelper = state.helper.initialized.find(i => i.pool.address === data.address);
      setHelper(poolHelper);
      setMeta(poolHelper)
    }
    if (data && data.address && state.helper && !helper) setPool();
  }, [ state.web3.injected, data, state.helper ]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  const sortSwaps = async(swaps, book) => {
    for(let order in swaps){
      let {
        tokenIn,
        tokenOut,
        tokenAmountIn,
        tokenAmountOut,
        timestamp,
        id
      } = swaps[order]

      let input = helper.getTokenByAddress(tokenIn);
      let output = helper.getTokenByAddress(tokenOut);
      let transactionHash = id.split('-')[0];

      book.push({
        input: `${formatBalance(toBN(tokenAmountIn), input.decimals, 2)} ${input.symbol}`,
        output: `${formatBalance(toBN(tokenAmountOut), output.decimals, 2)} ${output.symbol}`,
        tx: <ButtonTransaction value={transactionHash} />,
        time: `${timestamp}`,
      })
    }
    return book;
  }

  const sortTrades = (trades, history) => {
    for(let order in trades){
      let {
        amount0In,
        amount1In,
        amount0Out,
        amount1Out,
        timestamp,
        transaction,
        pair: {
          token0: { id: token0Address }
        }
      } = trades[order];
      const poolIsToken0 = token0Address.toLowerCase() === meta.address.toLowerCase();
      let poolAmountIn, poolAmountOut, wethAmountIn, wethAmountOut;
      if (poolIsToken0) {
        poolAmountIn = amount0In;
        poolAmountOut = amount0Out;
        wethAmountIn = amount1In;
        wethAmountOut = amount1Out;
      } else {
        wethAmountIn = amount0In;
        wethAmountOut = amount0Out;
        poolAmountIn = amount1In;
        poolAmountOut = amount1Out;
      }

      // let orderType = parseFloat(amount0In) === 0 ? 'SELL' : 'BUY'

      if (parseFloat(wethAmountIn) === 0) {
        history.push({
          input: `${parseFloat(poolAmountIn).toFixed(2)} ${data.symbol}`,
          output: `${parseFloat(wethAmountOut).toFixed(2)} ETH`,
          tx: <ButtonTransaction value={transaction.id} />,
          time: `${timestamp}`,
          type: 'SELL'
        })
      } else {
        history.push({
          input: `${parseFloat(wethAmountIn).toFixed(2)} ETH`,
          output: `${parseFloat(poolAmountOut).toFixed(2)} ${data.symbol}`,
          tx: <ButtonTransaction value={transaction.id} />,
          time: `${timestamp}`,
          type: 'BUY'
        })
      }
    }
    return history;
  }

  useEffect(() => {
    const getTrades = async() => {
      if(Object.values(data).length > 0 && meta !== dummy && helper) {
        let pair = computeUniswapPairAddress(process.env.REACT_APP_WETH, meta.address);
        let swaps = await getSwaps(meta.address.toLowerCase());
        let trades = await getMarketTrades(pair);
        let history = await sortTrades(trades, []);
        let orderbook = await sortSwaps(swaps, []);

        setTrades(history)
        setSwaps(orderbook)
      }
    }
    getTrades()
  }, [ meta, helper ])

  let { height, width, spacing, infoSpacing } = style.getFormatting()

  return (
    <div className={classes.root} style={{ height, width }}>
      <div className={classes.tabs}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
        >
          <Tab key='assets' label="ASSETS" {...a11yProps(0)} />
          <Tab key='trades' label="TRADES" {...a11yProps(1)} />
          <Tab key='assets' label="SWAPS" {...a11yProps(2)} />
          <Tab key='info' label="INFO" {...a11yProps(3)} />
        </Tabs>
      </div>

      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={spacing} style={{ paddingBottom: 17.5 }}>
          {state.request && data.active && helper &&
            helper.tokens.map((token, i) => (
              <Grid item key={i}>
                <WeightedToken token={token} />
              </Grid>
           ))}
          {!state.request && (<Loader color={state.background} />)}
        </Grid>
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={1}>
        <List height={height} columns={marketColumns} data={trades} />
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={2}>
        <List height={height} columns={swapsColumns} data={swaps} />
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={3}>
        <Grid item container direction='row' alignItems='flex-start' justify='start' spacing={infoSpacing}>
          <Grid item key='uniswap'>
            <div>
              <Link to={`/category/0x${data.category}`}>
                <ButtonPrimary variant='outlined' margin={{ marginLeft: 20, marginTop: 12.5, marginBottom: 12.5 }}>
                  CATEGORY
                </ButtonPrimary>
              </Link>
              <Link to={`/pool/${data.address}`}>
                <ButtonSecondary variant='outlined' margin={{ marginLeft: 15, marginTop: 12.5, marginBottom: 12.5  }}>
                  VIEW POOL
                </ButtonSecondary>
              </Link>
            </div>
            <a target='_blank' rel="noopener noreferrer" href={`https://${process.env.REACT_APP_ETH_NETWORK === 'rinkeby' ? 'rinkeby.' : ''}etherscan.io/token/${data.address}`}>
              <IconButton variant='outlined' margin={{ marginLeft: 25 }}>
                <img src={etherscan} style={{ width: 37.5 }} />
              </IconButton>
            </a>
            <a target='_blank' rel="noopener noreferrer" href={`https://info.uniswap.org/token/${data.address}`}>
              <IconButton variant='outlined' margin={{ marginLeft: 25 }}>
                <img src={uni} style={{ width: 37.5 }} />
              </IconButton>
            </a>
          </Grid>
          <Grid item>
            <div className={classes.stats}>
              <ul>
                <li> CUMULATIVE FEES: ${parseFloat(parseFloat(meta.pool.feesTotalUSD).toFixed(2)).toLocaleString()}</li>
                <li> VOLUME: ${data.volume ? data.volume.toLocaleString() : '0.00'}</li>
                <li> SWAP FEE: {formatBalance(meta.pool.swapFee, 18, 4) * 100}%</li>
                <li> TVL: ${data.marketcap ? data.marketcap.toLocaleString() : '0.00'}</li>
                <li> SUPPLY: {data.supply ? data.supply.toLocaleString() : '0.00'}</li>
              </ul>
            </div>
          </Grid>
        </Grid>
      </TabPanel>
    </div>
  );
}

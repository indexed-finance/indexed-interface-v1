import React, { Fragment, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { makeStyles, styled } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ContentLoader from "react-content-loader"
import { Link } from 'react-router-dom'

import { formatBalance, BigNumber } from '@indexed-finance/indexed.js/dist/utils/bignumber'
import ButtonPrimary from '../buttons/primary'
import TransactionButton from '../buttons/transaction'
import WeightedToken from './weighted-token'
import List from '../list'

import style from '../../assets/css/components/tabs'
import { getPair } from '../../lib/markets'
import { getMarketTrades } from '../../api/gql'
import { store } from '../../state'
import getStyles from '../../assets/css'

import { marketColumns } from '../../assets/constants/parameters'

const WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
const BN_ZERO = new BigNumber(0)

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

const Loader = ({ color, height, width }) => (
    <ContentLoader
      speed={1}
      height={500}
      width={1000}
      backgroundColor={color}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <rect x="115" y="40" rx="3" ry="3" width="200" height="25" />
      <circle cx="65" cy="50" r="30" />
      <rect x="490" y="40" rx="3" ry="3" width="200" height="25" />
      <circle cx="440" cy="50" r="30" />
      <rect x="115" y="130" rx="3" ry="3" width="200" height="25" />
      <circle cx="65" cy="140" r="30" />
      <rect x="490" y="130" rx="3" ry="3" width="200" height="25" />
      <circle cx="440" cy="140" r="30" />
  </ContentLoader>
)

function hash(value, og) {
  return (
    <a style={{ 'text-decoration': 'none' }} href={`https://rinkeby.etherscan.io/tx/${og}`} target='_blank'>
      <TransactionButton> <o>{value}</o>&nbsp;<Exit/> </TransactionButton>
    </a>
  )
}

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

export default function VerticalTabs({ data }) {
  const [ trades, setTrades ] = useState([])
  const [ value, setValue ] = useState(0)
  const [ meta, setMeta ] = useState(dummy)
  const classes = useStyles()
  const [helper, setHelper] = useState(undefined);

  let { state } = useContext(store);

  useEffect(() => {
    if (data && data.address) {
      console.log(`Got Data Address!!! ${data.address}`)
    }
  }, [data]);
  useEffect(() => {
    const setPool = async() => {
      console.log(`SETPOOL:: ${data.address}`)
      let poolHelper = state.helper.initialized.find(i => i.pool.address === data.address);
      setHelper(poolHelper);
      setMeta(poolHelper)
      console.log(`Setting Pool Helper!!`);
      console.log(`Helper Has Tokens ${poolHelper.tokens.map(t => t.symbol)}`)
        }
    if (data && data.address && state.helper && !helper) setPool();
  }, [ state.web3.injected, data, state.helper ]);

  const shortenHash = receipt => {
    let length = receipt.length
    let z4 = receipt.substring(0, 4)
    let l4 = receipt.substring(length-4, length)
    return `${z4}...${l4}`
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  useEffect(() => {
    const getTrades = async() => {
      if(Object.values(data).length > 0){
        let pair = await getPair(state.web3.rinkeby, WETH, data.address)
        let trades = await getMarketTrades(pair.options.address)
        let history = []

        for(let order in trades){
          let {
            amount0In, amount1In, amount0Out, amount1Out, timestamp, transaction
          } = trades[order]

          let orderType = parseFloat(amount1In) == 0 ? 'SELL' : 'BUY'
          let short = shortenHash(transaction.id)

          if(orderType == 'BUY'){
            history.push({
              output: `${parseFloat(amount0Out).toFixed(2)} ${data.symbol}`,
              input: `${parseFloat(amount1In).toFixed(2)} ETH`,
              tx: hash(short, transaction.id),
              time: Date.now(timestamp*1000),
              type: orderType
            })
          } else {
            history.push({
              input: `${parseFloat(amount0In).toFixed(2)} ${data.symbol}`,
              output: `${parseFloat(amount1Out).toFixed(2)} ETH`,
              tx: hash(short, transaction.id),
              time: Date.now(timestamp*1000),
              type: orderType
            })
          }
        }
        setTrades(history.reverse())
      }
    }
    getTrades()
  }, [ data ])

  console.log(data)

  let { height } = style.getFormatting()

  return (
    <div className={classes.root} style={{ height }}>
      <div className={classes.tabs}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
        >
          <Tab key='assets' label="ASSETS" {...a11yProps(0)} />
          <Tab key='trades' label="TRADES" {...a11yProps(1)} />
          <Tab key='info' label="INFO" {...a11yProps(2)} />
        </Tabs>
      </div>

      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={4}>
          {state.request && data.active && helper &&
            helper.tokens.map((token, i) => (<Grid item key={i}> <WeightedToken token={token} /> </Grid> ))}
          {!state.request && (<Loader color={state.background} />)}
        </Grid>
      </TabPanel>

      <TabPanel className={classes.panels} value={value} index={1}>
        <List height={height} columns={marketColumns} data={trades} />
      </TabPanel>

      <TabPanel className={classes.panels} value={value} index={2}>
        <div className='item'>
          <Grid item container direction='column' alignItems='flex-start' justify='space-around' spacing={6}>
            <Grid item key='pool'>
              <Link to={`/pool/${data.address}`}>
                <ButtonPrimary variant='outlined' margin={{ marginLeft: 50 }}>
                  VIEW POOL
                </ButtonPrimary>
              </Link>
              <a target='_blank' rel="noopener noreferrer" href={`https://rinkeby.etherscan.io/token/${data.address}`}>
                <ButtonPrimary variant='outlined' margin={{ margin: 0 }}>
                  ETHERSCAN
                </ButtonPrimary>
              </a>
            </Grid>
            <Grid item key='uniswap'>
              <a target='_blank' rel="noopener noreferrer" href={`https://info.uniswap.org/pool/${data.address}`}>
                <ButtonPrimary variant='outlined' margin={{ marginRight: 25 }}>
                  🦄 UNISWAP
                </ButtonPrimary>
              </a>
            </Grid>
          </Grid>
        </div>
        <div className={classes.stats}>
          <ul>
            <li> TVL: ${data.marketcap}</li>
            <li> SUPPLY: {data.supply}</li>
            <li> GROSS FEES: ${parseFloat(meta.pool.feesTotalUSD).toFixed(2)}</li>
            <li> FEES: ${formatBalance(meta.pool.swapFee, 18, 4)}</li>
          </ul>
        </div>
      </TabPanel>
    </div>
  );
}

import React, { Fragment, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { makeStyles, styled } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Tabs from '@material-ui/core/Tabs'
import IconButton from '@material-ui/core/IconButton'
import Tab from '@material-ui/core/Tab'
import { Link } from 'react-router-dom'

import { formatBalance, BigNumber } from '@indexed-finance/indexed.js/dist/utils/bignumber'
import ButtonPrimary from '../buttons/primary'
import ButtonSecondary from '../buttons/secondary'
import TransactionButton from '../buttons/transaction'
import Loader from '../loaders/tabs'
import WeightedToken from './weighted-token'
import List from '../list'

import style from '../../assets/css/components/tabs'
import etherscan from '../../assets/images/etherscan.png'
import uni from '../../assets/images/uni.png'
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
    const setPool = async() => {
      let poolHelper = state.helper.initialized.find(i => i.pool.address === data.address);
      setHelper(poolHelper);
      setMeta(poolHelper)
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
      if(Object.values(data).length > 0 && meta != dummy){
        let pair = await getPair(state.web3[process.env.REACT_APP_ETH_NETWORK], WETH, meta.address)
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
  }, [ meta ])

  let { height, width, spacing } = style.getFormatting()

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
          <Tab key='info' label="INFO" {...a11yProps(2)} />
        </Tabs>
      </div>

      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={spacing}>
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
        <Grid item container direction='row' alignItems='flex-start' justify='start' spacing={4}>
          <Grid item key='uniswap'>
            <Link to={`/pool/${data.address}`}>
              <ButtonSecondary variant='outlined' margin={{ float: 'left', marginLeft: 20, marginTop: 12.5 }}>
                VIEW POOL
              </ButtonSecondary>
            </Link>
            <a target='_blank' rel="noopener noreferrer" href={`https://${process.env.REACT_APP_ETH_NETWORK}.etherscan.io/token/${data.address}`}>
              <IconButton variant='outlined' margin={{ marginLeft: 12.5 }}>
                <img src={etherscan} style={{ width: 37.5 }} />
              </IconButton>
            </a>
            <a target='_blank' rel="noopener noreferrer" href={`https://info.uniswap.org/pool/${data.address}`}>
              <IconButton variant='outlined' margin={{ marginLeft: 12.5 }}>
                <img src={uni} style={{ width: 37.5 }} />
              </IconButton>
            </a>
          </Grid>
          <Grid item>
            <div className={classes.stats}>
              <ul>
                <li> GROSS FEES: ${parseFloat(meta.pool.feesTotalUSD).toFixed(2)}</li>
                <li> FEES: ${formatBalance(meta.pool.swapFee, 18, 4)}</li>
                <li> TVL: ${data.marketcap}</li>
                <li> SUPPLY: {data.supply}</li>
              </ul>
            </div>
          </Grid>
        </Grid>
      </TabPanel>
    </div>
  );
}

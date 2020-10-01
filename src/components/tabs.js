import React, { Fragment, useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'

import { makeStyles, styled } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import TransactionButton from './buttons/transaction'
import Weights from './weights'
import List from './list'

import { getPair } from '../lib/markets'
import { getMarketTrades } from '../api/gql'
import { store } from '../state'

import { marketColumns } from '../assets/constants/parameters'

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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={index == 0 ? 3 : 0}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 150,
    padding: 0
  },
  tabs: {
    borderRight: `2px solid #666666`,
    width: 'auto'
  },
  panels: {
    width: '100%',
    padding: 0
  },
  assets: {
    paddingTop: 7.5,
    overflowY: 'scroll',
    width: '100%'
  }
}))

export default function VerticalTabs({ data }) {
  const [ trades, setTrades ] = useState([])
  const [ value, setValue ] = useState(0)
  const [ meta, setMeta ] = useState([])
  const classes = useStyles()

  let { state } = useContext(store)

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
        let pair = await getPair(state.web3.rinkeby, data.address)
        let trades = await getMarketTrades(pair.options.address)
        let history = []

        console.log(trades)

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
        setMeta(data.assets)
      }
    }
    getTrades()
  }, [ data ])

  return (
    <div className={classes.root}>
      <div className={classes.tabs}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
        >
          <Tab label="ASSETS" {...a11yProps(0)} />
          <Tab label="TRADES" {...a11yProps(1)} />
        </Tabs>
      </div>
      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={4}>
          {meta.map(asset => (<Grid item> <Weights asset={asset} /> </Grid> ))}
        </Grid>
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={1}>
        <List height={150} columns={marketColumns} data={trades} />
      </TabPanel>
    </div>
  );
}

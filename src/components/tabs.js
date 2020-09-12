import React, { Fragment, useState, useEffect } from 'react'
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

import { marketColumns, rebalanceColumns } from '../assets/constants/parameters'

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

function createData(time, input, output, transaction, fee) {
  return { time, input, output, transaction, fee }
}

function createAlt(time, type, price, amount, transaction) {
  return { time, type, price, amount, transaction }
}

function hash(value) {
  return <TransactionButton> <o>{value}</o>&nbsp;<Exit/> </TransactionButton>
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  }
}

const marketRows = [
  createAlt(parseInt(Date.now() * 1), 'SELL', '$5,403.22', '100,001.03 CCI', hash('0x411...641')),
  createAlt(parseInt(Date.now() * 1.0025), 'SELL', '$5,404.00', '50,023.12 CCI', hash('0x543...431')),
  createAlt(parseInt(Date.now()* 1.0030), 'BUY', '$5,404.00', '100,420.21', hash('0x861...310')),
  createAlt(parseInt(Date.now()* 1.0035), 'BUY',  '$5,403.52', '100.21 CCI', hash('0x912...006')),
  createAlt(parseInt(Date.now()* 1.0040), 'SELL', '$5,403.49', '0.53 CCI', hash('0x444...215')),
]

const rebalanceRows = [
  createData(parseInt(Date.now() * 1), '20.31 WBTC', '176.42 COMP', hash('0x411...641'), '$605.64'),
  createData(parseInt(Date.now() * 1.0025), '2500.34 MKR', '100,341.23 ETH', hash('0x543...431'),  '$5031.02'),
  createData(parseInt(Date.now()* 1.0030), '7,250,301 DAI', '8,002,319 USDC', hash('0x861...310'), '$800.23'),
  createData(parseInt(Date.now()* 1.0035), '1.31 WBTC', '600,102.42 SNX', hash('0x912...006'), '$78.12'),
  createData(parseInt(Date.now()* 1.0040), '7,034,111 LINK', '2,444,120.34 USDT', hash('0x444...215'),  '$240.11'),
]

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
  const [ value, setValue ] = useState(0)
  const [ meta, setMeta ] = useState([])
  const classes = useStyles()

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  useEffect(() => {
    if(data != undefined){
      setMeta(data)
    }
  }, [ data ])

  return (
    <div className={classes.root}>
      <div className={classes.tabs}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
        >
          <Tab label="ASSETS" {...a11yProps(0)} />
          <Tab label="TRADES" {...a11yProps(0)} />
          <Tab label="REBALANCES" {...a11yProps(1)} />
        </Tabs>
      </div>
      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={4}>
          {meta.map(asset => (<Grid item> <Weights asset={asset} /> </Grid> ))}
        </Grid>
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={1}>
        <List height={150} columns={marketColumns} data={marketRows} />
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={2}>
        <List height={150} columns={rebalanceColumns} data={rebalanceRows} />
      </TabPanel>
    </div>
  );
}

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { makeStyles, styled } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ExitIcon from '@material-ui/icons/ExitToApp'

import Weights from './weights'
import List from './list'

import eth from '../assets/images/ethereum.png'
import mkr from '../assets/images/maker.png'
import dai from '../assets/images/dai.png'
import wbtc from '../assets/images/wrappedbitcoin.png'
import comp from '../assets/images/compound.png'
import link from '../assets/images/chainlink.png'
import ampl from '../assets/images/ampleforth.png'
import snx from '../assets/images/synthetix.png'
import usdt from '../assets/images/tether.png'
import usdc from '../assets/images/usdc.png'

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

const columns = [
  { id: 'time', label: 'Time', minWidth: 100 },
  {
    id: 'input',
    label: 'Trade in',
    minWidth: 125,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'output',
    label: 'Trade out',
    minWidth: 125,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'transaction',
    label: 'Transaction',
    minWidth: 100,
    align: 'center',
    bodyRender: (value) => {
      return <label> {value}<Exit/> </label>
    }
  },
  {
    id: 'fee',
    label: 'Fee',
    minWidth: 75,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

function createData(time, input, output, transaction, fee) {
  return { time, input, output, transaction, fee };
}

function hash(value) {
  return <label> {value}&nbsp;<Exit/> </label>
}

const rows = [
  createData(parseInt(Date.now() * 1), '20.31 WBTC', '176.42 COMP', hash('0x411...641'), '$605.64'),
  createData(parseInt(Date.now() * 1.0025), '2500.34 MKR', '100,341.23 ETH', hash('0x543...431'),  '$5031.02'),
  createData(parseInt(Date.now()* 1.0030), '7,250,301 DAI', '8,002,319 USDC', hash('0x861...310'), '$800.23'),
  createData(parseInt(Date.now()* 1.0035), '1.31 WBTC', '600,102.42 SNX', hash('0x912...006'), '$78.12'),
  createData(parseInt(Date.now()* 1.0040), '7,034,111 LINK', '2,444,120.34 USDT', hash('0x444...215'),  '$240.11'),
];

const Transaction = styled(Button)({
  border: '2px solid ',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.5em',
  '&:hover': {
    color: '#009966',
    fontWeight: 'bold'
  }
})

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
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
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
}));

export default function VerticalTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
          <Tab label="Assets" {...a11yProps(0)} />
          <Tab label="Rebalances" {...a11yProps(1)} />
        </Tabs>
      </div>
      <TabPanel className={classes.assets} value={value} index={0}>
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={4}>
          <Grid item>
            <Weights color='#00D395' image={comp} name='Compound (COMP)' value={27.5} holdings='1,673 COMP' />
          </Grid>
          <Grid item>
            <Weights color='#999999' image={eth} name='Ethereum (ETH)' value={50} holdings='767,310.43 ETH' />
          </Grid>
          <Grid item>
            <Weights color='orange' image={wbtc} name='Wrapped Bitcoin (WBTC)' value={25} holdings='10,100 WBTC' />
          </Grid>
          <Grid item>
            <Weights color='rgb(26, 171, 155)' image={mkr} name='MakerDAO (MKR)' value={25} holdings='5,100 MKR' />
          </Grid>
          <Grid item>
            <Weights color='#22a079' image={usdt} name='Tether (USDT)' value={70} holdings='150,412,555 USDT' />
          </Grid>
          <Grid item>
            <Weights color='#0a258a' image={link} name='Chainlink (LINK)' value={50} holdings='5,000,323 LINK' />
          </Grid>
          <Grid item>
            <Weights color='#007aff' image={usdc} name='USD Coin (USDC)' value={20} holdings='1,750,321 USDC' />
          </Grid>
          <Grid item>
            <Weights color='rgb(249, 166, 6)' image={dai} name='Dai (DAI)' value={15} holdings='240,023,100 DAI' />
          </Grid>
          <Grid item>
            <Weights color='rgb(18, 4, 70)' image={snx} name='Synthetix (SNX)' value={30} holdings='50,441,123 SNX' />
          </Grid>
          <Grid item>
            <Weights color='#333333' image={ampl} name='Ampleforth (AMPL)' value={5} holdings='150,312.44 AMPL' />
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel className={classes.panels} value={value} index={1}>
        <List height={150} columns={columns} data={rows} />
      </TabPanel>
    </div>
  );
}

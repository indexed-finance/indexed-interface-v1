import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import Weights from './weights'

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
        <Box p={3}>
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
  },
  tabs: {
    borderRight: `1px solid #999999`,
    width: 'auto'
  },
  panels: {
    paddingTop: 7.5,
    overflowY: 'scroll'
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
          <Tab label="Reweights" {...a11yProps(1)} />
          <Tab label="Rebalances" {...a11yProps(2)} />
        </Tabs>
      </div>
      <TabPanel className={classes.panels} value={value} index={0}>
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
        <Grid item container direction='row' alignItems='flex-start' justify='space-around' spacing={3}>
          Test
        </Grid>
      </TabPanel>
      <TabPanel  className={classes.panels} value={value} index={2}>
        Item Three
      </TabPanel>
    </div>
  );
}

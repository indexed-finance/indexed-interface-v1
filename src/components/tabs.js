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
    height: 225,
  },
  tabs: {
    borderRight: `1px solid #999999`,
  },
  panels: {
    width: '75%',
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
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab label="Assets" {...a11yProps(0)} />
        <Tab label="Reweights" {...a11yProps(1)} />
        <Tab label="Rebalances" {...a11yProps(2)} />
      </Tabs>
      <TabPanel className={classes.panels} value={value} index={0}>
        <Grid container direction='column' alignItems='flex-start' justify='flex-start'>
          <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
            <Grid item>
              <Weights color='grey' image={eth} name='Ethereum (ETH)' value={50} holdings='767,310.43 ETH' />
            </Grid>
            <Grid item>
              <Weights color='green' image={mkr} name='MakerDAO (MKR)' value={25} holdings='5,100 MKR' />
            </Grid>
            <Grid item>
              <Weights color='orange' image={dai} name='Dai (DAI)' value={10} holdings='240,023,100 DAI' />
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
      <TabPanel value={value} index={4}>
        Item Five
      </TabPanel>
      <TabPanel value={value} index={5}>
        Item Six
      </TabPanel>
      <TabPanel value={value} index={6}>
        Item Seven
      </TabPanel>
    </div>
  );
}

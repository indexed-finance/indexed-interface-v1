import React, { useState, useEffect, useContext, Fragment } from 'react'

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useParams } from 'react-router-dom'

import style from '../assets/css/routes/category'
import Container from '../components/container'
import List from '../components/list'
import getStyles from '../assets/css'
import { store } from '../state'

import ReactMarkdown from 'react-markdown'
const gfm = require('remark-gfm')

export const tokenColumns = [
  { id: 'name', label: 'NAME', minWidth: 200 },
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 25,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'priceUSD',
    label: 'PRICE',
    minWidth: 25,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  }
]

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
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

const useStyles = getStyles(style);

export default function Category() {
  const [ category, setCategory ] = useState({ description: null, tokens: [] });
  const { state } = useContext(store);
  const { categories } = state;
  const { id } = useParams();
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
     setValue(newValue);
   };

  useEffect(() => {
    const getCategory = async() => {
      if (!category.description && categories[id] && state.indexes) {
        let { indexes } = categories[id]
        let pools = indexes.map(i => state.indexes[i])
        let categoryTokens = []
        let assets = {}

        for(let x = 0; x < pools.length; x++){
          let fund = pools[x]

          await fund.assets.map(i => {
            if(!assets[i.symbol]) categoryTokens.push(i)
          })
        }

        setCategory({
          description: categories[id].description,
          tokens: categoryTokens
        });
      }
    }
    getCategory()
  }, [ state.indexes, categories ]);

  let { margin } = style.getFormatting(state)

  return (
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={8} lg={8} xl={8}>
        <ParentSize>
          {({ width, height }) => (
            <Container margin={margin} padding="1em 0em" title='CATEGORY'>
              <div className={classes.header} style={{ width }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                >
                  <Tab label="DESCRIPTION" value={0} / >
                  <Tab label="TOKENS" value={1} />
                </Tabs>
             </div>
              <TabPanel value={value} index={0}>
                <div className={classes.body}>
                  <div id='cat-md' />
                  {category.description && (
                    <ReactMarkdown>
                      {category.description.replace(/[\n]{1}/g, '\n\n').replace()}
                    </ReactMarkdown>
                  )}
                </div>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <List height='auto' columns={tokenColumns} data={category.tokens} />
              </TabPanel>
          </Container>
        )}
      </ParentSize>
    </Grid>
  </Grid>
  )
}

import React, { useState, useEffect, useContext, Fragment } from 'react'

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useParams } from 'react-router-dom'

import { tokenMetadata } from '../assets/constants/parameters'
import { getCategory } from '../api/gql'
import style from '../assets/css/routes/category'
import Container from '../components/container'
import List from '../components/list'
import getStyles from '../assets/css'
import { store } from '../state'

import ReactMarkdown from 'react-markdown'
const gfm = require('remark-gfm')

export const tokenColumns = [
  { id: 'name', label: 'NAME', minWidth: 150 },
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
        <Box p={3} style={{ padding: 0 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ImageCell = (i) =>  (
  <div style={{ display: 'inline-flex', flexWrap: 'nowrap', alignItems: 'center' }}>
    <img src={tokenMetadata[i.symbol].image} style={{ float: 'left', width: 35, padding: 5 }} />
    <span style={{ marginBlock: 0, marginLeft: 17.5, clear: 'both' }}> {tokenMetadata[i.symbol].name} </span>
  </div>
)

const useStyles = getStyles(style);

export default function Category() {
  const [ category, setCategory ] = useState({ description: null, tokens: [] });
  const [value, setValue] = useState(0);
  const { id } = useParams();
  const classes = useStyles();

  let { state } = useContext(store);
  const { categories } = state;

  const handleChange = (event, newValue) => {
     setValue(newValue);
   };

  useEffect(() => {
    const getCategory = async() => {
      if (!category.description && categories[id]) {
        setCategory({
          ...category,
          description: categories[id].description,
        });
      }
    }
    getCategory()
  }, [ category, categories ]);

  useEffect(() => {
    const getCategoryTokens = async() => {
      let categoryTokens = await getCategory(id)

      for(var x = 0; x < categoryTokens.length; x++){
        let { priceUSD } = categoryTokens[x]
        categoryTokens[x].priceUSD = '$' + parseFloat(priceUSD).toFixed(2)

        categoryTokens[x].name = ImageCell(categoryTokens[x])
      }

      setCategory({
        ...category,
        tokens: categoryTokens,
      });
    }
    getCategoryTokens()
  }, [])

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
                  className={classes.tab}
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

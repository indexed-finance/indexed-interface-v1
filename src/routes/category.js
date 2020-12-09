import React, { useState, useEffect, useContext, Fragment } from 'react'

import Grid from '@material-ui/core/Grid'
import { useParams } from 'react-router-dom'

import style from '../assets/css/routes/stake'
import Container from '../components/container'
import getStyles from '../assets/css'
import { store } from '../state'
// import ReactMarkdown from 'react-markdown'
import ReactMarkdown from 'react-markdown'
const gfm = require('remark-gfm')

const useStyles = getStyles(style);

/*     <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item xs={10} md={6} lg={6} xl={6} >
        <Container margin={margin} padding="1em 2em" title='LIQUIDITY MINING'>
          <div className={classes.header}>
            <p>
              Stake index tokens or their associated Uniswap liquidity tokens to earn NDX, the governance token for Indexed Finance.
            </p>
            {
              process.env.REACT_APP_ETH_NETWORK === 'rinkeby' ?
              <React.Fragment>
                <p> TIME REMAINING: </p>
                <h3> <Countdown date={startTime} /> </h3>
              </React.Fragment>
              : <p>STAKING HAS NOT BEGUN</p>
            }
          </div>
        </Container>
      </Grid> */

export default function Category() {
  const [category, setCategory] = useState(null);
  const { state } = useContext(store);
  const { categories } = state;
  const { id } = useParams();
  useEffect(() => {
    if (!category) setCategory(categories[id]);
  }, [categories]);

  console.log(categories)
  // const category = categories[id];
  console.log(category)
  const classes = useStyles()
  // { category && render(<ReactMarkdown>{category.description}</ReactMarkdown>, document.getElementById('cat-md')) }
 /*  if (category) {
    render(<ReactMarkdown source={category.description} />, document.getElementById('cat-md'))
  // } */// render(<ReactMarkdown>{category.description}</ReactMarkdown>, document.getElementById('cat-md')) }
  return <Grid container direction='column' alignItems='center' justify='center'>
    <Grid item xs={10} md={6} lg={6} xl={6} >
      <Container padding="1em 2em" title='LIQUIDITY MINING'>
        <div className={classes.header}>
          <div id='cat-md' />
            { category && <ReactMarkdown>
              {category.description.replace(/[\n]{1}/g, '\n\n').replace()}
            </ReactMarkdown> }
        </div>
      </Container>
    </Grid>
  </Grid>
}
import React, { Fragment, useState, useEffect, useContext } from "react"

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import Container from '../components/container'
import List from '../components/list'

import { Link } from 'react-router-dom'
import { formatBalance } from '@indexed-finance/indexed.js'
import { tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/categories'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

function getHelperData(arr) {
  if(!arr || arr.length == 0) return []

  return arr.map((value, i) => {
    let props = { ...value }

    if(props.active) {
      let { pool } = props.poolHelper

      props.swapFeeUSD = '$' + formatBalance(pool.swapFee, 18, 4)
      props.feesTotalUSD = '$' + pool.feesTotalUSD
    }

    return { ...props }
  })
}


const columns = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'size',
    label: 'SIZE',
    minWidth: 25,
    align: 'center',
  },
  {
    id: 'price',
    label: 'PRICE',
    minWidth: 75,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'supply',
    label: 'SUPPLY',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'marketcap',
    label: 'MARKETCAP',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'swapFeeUSD',
    label: 'SWAP FEE',
    minWidth: 50,
    align: 'center',
    format: (value) => `$${value.pool.swapFeeUSD.toLocaleString('en-US')}`,
  },
  {
    id: 'feesTotalUSD',
    label: 'CUMULATIVE FEES',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.pool.feesTotalUSD.toLocaleString('en-US')}`,
  },
  {
    id: 'volume',
    label: 'VOLUME',
    minWidth: 150,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
];

const filtered = (raw, targets) =>
  Object.keys(raw, targets)
  .filter(key => targets.includes(key))
  .reduce((obj, key) => {
    obj[key] = raw[key];
    return obj;
  }, {})

function getCategoryImages(category, state) {
  let isSelected = {};
  let categoryImages = [];

  category.indexes.map((index) =>
    state.indexes[index].assets.map((token) => {
      if(isSelected[token.symbol]) return;
      else isSelected[token.symbol] = true;
      return categoryImages.push(
        tokenMetadata[token.symbol].image
      );
    })
  )

  return categoryImages
}

export default function Categories(){
  let { dispatch, state } = useContext(store)

  const [ rows, setRows ] = useState({})
  const classes = useStyles()

  useEffect(() => {
    if(Object.keys(state.categories).length > 0){
      setRows(state.categories)
    }
  }, [ state.indexes ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let { margin } = style.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Container margin={margin} padding="1em 0em" title='CATEGORIES'>
            <Fragment>
              {Object.values(rows).map((value, i) => (
                <div className={classes.category}>
                  <div className={classes.title}>
                    <Link to={`/category/${Object.keys(rows)[i]}`}>
                      <h3> {value.name} [{value.symbol}]</h3>
                    </Link>
                    <p>
                      {state.request && getCategoryImages(value, state).map(i => (
                        <img src={i} className={classes.asset} />
                      ))}
                    </p>
                  </div>
                  <div className={classes.divider} />
                  {console.log(Object.values(filtered(state.indexes, value.indexes)))}
                  <List
                    data={getHelperData(Object.values(filtered(state.indexes, value.indexes)))}
                    columns={columns}
                    props={state.indexes}
                    height={250}
                    href
                  />
                </div>
               )
              )}
            </Fragment>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

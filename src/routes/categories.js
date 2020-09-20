import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import Container from '../components/container'
import Select from '../components/inputs/select'
import Input from '../components/inputs/input'
import List from '../components/list'

import { tokenMetadata } from '../assets/constants/parameters'
import { store } from '../state'

const selections = [[{ value: 0, label: null }]]

const useStyles = makeStyles((theme) => ({
    category: {
      width: '100%',
      marginBottom: '2.5em'
    },
    divider: {
      borderBottom: '#666666 solid 3px',
    },
    asset: {
      width: 25,
      marginRight: 10
    }
  })
)

const columns = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'price',
    label: 'PRICE',
    minWidth: 150,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'supply',
    label: 'TOTAL SUPPLY',
    minWidth: 125,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'tokens',
    label: 'ASSETS',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'action',
    minWidth: 150,
    align: 'right',
  },
];

const filtered = (raw, targets) =>
  Object.keys(raw, targets)
  .filter(key => targets.includes(key))
  .reduce((obj, key) => {
    obj[key] = raw[key];
    return obj;
  }, {})

const Liquidity = styled(Button)({
  border: '2px solid #009966',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.5em',
  '&:hover': {
    color: '#009966',
    fontWeight: 'bold'
  }
})

const Canvas = styled(Paper)({
  border: '3px solid #666666',
  borderRadius: 10,
  margin: '1.5em 3em',
  padding: '1.5em',
})

const Trigger = styled(Button)({
  border: '2px solid #999999',
  color: '#999999',
  borderRadius: 5,
  padding: '.2em 2em',
  marginTop: '7.5px',
  marginLeft: 'auto',
  '&:hover': {
    fontWeight: 'bold',
    color: '#333333'
  }
})

export default function Categories(){
  let { dispatch, state } = useContext(store)

  const [ rows, setRows ] = useState({})
  const classes = useStyles()

  useEffect(() => {
    if(Object.keys(state.categories).length > 0){
      setRows(state.categories)
    }
  }, [ state.indexes ])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Container margin='3em 3em' padding="1em 2em" percentage='16%' title='CATEGORIES'
             components={
              <Fragment>
                {Object.values(rows).map((value) => (
                  <div className={classes.category}>
                    <h3> {value.name} [{value.symbol}]</h3>
                    <p>
                      {value.indexes.map((index) =>
                        state.indexes[index].assets.map((token) => (
                          <img src={tokenMetadata[token.symbol].image} className={classes.asset} />
                      )))}
                    </p>
                    <div className={classes.divider} />
                    <List data={Object.values(filtered(state.indexes, value.indexes))}
                      action={ <Liquidity> EXPAND </Liquidity>}
                      columns={columns}
                      height={250}
                    />
                  </div>
                 )
               )}
             </Fragment>
            }
          />
        </Grid>
      </Grid>
    </Fragment>
  )
}

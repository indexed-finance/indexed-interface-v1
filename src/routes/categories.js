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

import { tokenMapping, tokenImages } from '../assets/constants/parameters'
import { getTokenCategories } from '../api/gql'
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
    id: 'index',
    label: 'INDEX',
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
    label: 'TOKENS',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'action',
    minWidth: 150,
    align: 'right',
  },
];

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
  const [ rows, setRows ] = useState([])
  let { dispatch, state } = useContext(store)
  const classes = useStyles()

  useEffect(() => {
    const retrieveCategories = async() => {
      let metadata = await getTokenCategories()

      setRows(
        metadata.map((value) => {
          return {
            tokens: value.tokens.map(address => { return tokenMapping[address].symbol }),
            funds: value.indexPools.map((item, index) => {
              return {
                tokens:
                  value.tokens.map((address, index) => {
                    if(index <= item.size) return tokenMapping[address].symbol
                }).join(', '),
                supply: parseInt(item.totalSupply)/Math.pow(10, 18),
                price: '$5,410.34',
                size: item.size,
                index: index + 1
              }
            }),
            symbol: value.symbol,
            name: value.name,
          }
        })
      )
    }

    retrieveCategories()
  }, [])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Container percentage='15%' title='CATEGORIES'
            components={
              <Fragment>
              {rows.map((value) => (
                <div className={classes.category}>
                  <h3> {value.name} [{value.symbol}]</h3>
                  <p> {value.tokens.map((token) => ( <img src={tokenImages[token]} className={classes.asset}/> ))} </p>
                  <div className={classes.divider} />
                  <List data={value.funds} columns={columns} height={250}
                    action={
                      <Liquidity> EXPAND </Liquidity>
                    } />
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
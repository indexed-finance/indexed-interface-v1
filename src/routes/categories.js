import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import Container from '../components/container'
import Select from '../components/select'
import List from '../components/list'
import Input from '../components/input'

import { tokenMapping } from '../assets/constants/parameters'
import { getTokenCategories } from '../api/gql'
import { store } from '../state'

const selections = [[{ value: 0, label: null }]];

const formatArray = (array) => {
  let string = ''
  array.map((cell, index) => {
    console.log(cell)
    if(index == 0) string = cell
    else string = string + ', ' + cell
  })
  console.log(string)
  return string
}

const columns = [
  { id: 'name', label: 'NAME', minWidth: 200 },
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'size',
    label: 'TOKENS',
    minWidth: 50,
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
    id: 'pools',
    label: 'POOLS',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'action',
    minWidth: 150,
    align: 'center',
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

  useEffect(() => {
    const retrieveCategories = async() => {
      let metadata = await getTokenCategories()

      setRows(
        metadata.map((value) => {
          return {
            tokens:
              value.tokens.map((address, index) => {
                return { ...tokenMapping[address] }
              }),
            supply:
              value.indexPools.reduce((a,b) => {
                return a + parseInt(b.totalSupply/Math.pow(10,18))
              }, 0),
            size:
              value.indexPools.reduce((a,b) => {
                return a + b.size
             }, 0),
            pools: value.indexPools.length,
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
              <List data={rows} columns={columns} height={250}
              action={
                <Liquidity> EXPLORE </Liquidity>
              } />
            }
          />
        </Grid>
      </Grid>
    </Fragment>
  )
}

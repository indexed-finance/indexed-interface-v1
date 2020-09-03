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

import { store } from '../state'

const selections = [[{ value: 0, label: null }]];

const columns = [
  { id: 'name', label: 'Name', minWidth: 200 },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'eoy',
    label: 'EOY',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    minWidth: 125,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'action',
    minWidth: 150,
    align: 'center',
  },
];

function createData(name, price, eoy, liquidity ) {
  return { name, price, eoy, liquidity };
}

const rows = [
  createData('Cryptocurrency Index [CCII]', 7232.23, 4.34, 125000.18),
  createData('DeFi Index [DEFII]', 10553.11, 2.11, 100232.18),
  createData('Governance Index [GOVII]', 25731.23, 1.12, 75000.11),
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

export default function Demo(){
  let { dispatch, state } = useContext(store)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Canvas>
            <Grid container direction='row' alignItems='flex-start' justify='space-between'>
              <Grid item>
                <div className="demo-option">
                  <h4> CREATE CATEGORY </h4>
                  <Input label="NAME" variant="outlined" />
                  <Input label="SYMBOL" variant="outlined" />
                  <Input label="DESCRIPTION" variant="outlined" />
                  <Trigger> CREATE </Trigger>
                </div>
              </Grid>
              <Grid item>
                <div className="demo-option">
                  <h4> ADD ASSET </h4>
                  <Select label="CATEGORY" selections={selections} />
                  <Input label="NAME" variant="outlined" />
                  <Input label="SYMBOL" variant="outlined" />
                  <Trigger> ADD </Trigger>
                </div>
              </Grid>
              <Grid item>
                <div className="demo-option">
                  <h4> ADD LIQUIDITY </h4>
                  <Select label="CATEGORY" selections={selections} />
                  <Select label="ASSET" selections={selections} />
                  <Input label="AMOUNT" variant="outlined" />
                  <Trigger> ADD </Trigger>
                </div>
              </Grid>
              <Grid item>
                <div className="demo-option">
                  <h4> DEPLOY INDEX </h4>
                  <Select label="CATEGORY" selections={selections} />
                  <Input label="SIZE" variant="outlined" />
                  <Trigger> DEPLOY </Trigger>
                </div>
              </Grid>
            </Grid>
          </Canvas>
        </Grid>
        <Grid item>
          <Container title='INDEXES'
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
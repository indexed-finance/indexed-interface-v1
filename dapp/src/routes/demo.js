import React, { Fragment, useState, useEffect, useContext } from "react"

import { styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import Container from '../components/container'
import Select from '../components/select'
import List from '../components/list'

import { store } from '../state'

const selections = [[{ value: 0, label: null }]];

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

const Input = styled(TextField)({
  borderRadius: 10,
  margin: '10px 0px',
  '& input': {
    padding: '.75em 1em',
  },
  '& label': {
    top: -5,
  },
  '& label:placeholder-shown': {
    color: '#666666',
    top: -5,
  },
  '& input:placeholder-shown + label': {
    color: '#666666',
    top: -5,
  },
  '& label + fieldset': {
    color: '#666666',
    top: -5,
  },
  '&:hover fieldset': {
   borderColor: '#8da1ff !important',
 },
 '& label.Mui-focused': {
   color: '#666666',
   top: 2.5,
 },
 '& input:valid + fieldset': {
   borderColor: '#999999',
   borderWidth: 2,
 },
 '& input:invalid + fieldset': {
   borderColor: 'red',
   borderWidth: 2,
 },
 '& input:valid:focus + fieldset': {
   borderWidth: 2,
   borderColor: '#999999',
   paddingRight: '5px !important',
   paddingLeft: '8px !important',
 },
 '& input:active + fieldset': {
   color: '#999999'
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
          <Container title='INDEXES' components={<List/>} />
        </Grid>
      </Grid>
    </Fragment>
  )
}

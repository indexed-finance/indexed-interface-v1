import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'

import Table from '../components/table'
import Spline from '../components/spline'
import indexed from '../assets/images/indexed.png'

import { store } from '../state'

const Container = styled(Paper)({
  padding: '1em 2em',
  border: '3px solid #666666',
  borderRadius: 10,
  margin: '1.5em 3em',
  '& header': {
    marginTop: '-2em',
    background: 'white',
    padding: '0em 1em 0em 1em',
    width: '7.5%',
  }
})

export default function Root(){
  let { state, dispatch } = useContext(store)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Container>
            <Spline/>
          </Container>
        </Grid>
        <Grid item>
          <Container>
            <header>
              <Typography variant='h5'> Markets </Typography>
            </header>
            <Table />
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

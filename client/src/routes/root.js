import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'

import Table from '../components/table'
import Spline from '../components/spline'
import Pie from '../components/pie'
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
    width: '8.75%',
  }
})

const Canvas = styled(Paper)({
  border: '3px solid #666666',
  borderRadius: 10,
  margin: '1.5em 3em',
  overflow: 'auto'
})

const Wrapper = styled(Paper)({
  borderLeft: '5px solid #666666',
  borderRight: '3px solid #666666',
  borderTop: '3px solid #666666',
  borderBottom: '3px solid #666666',
  borderTopLeftRadius: 100,
  borderBottomLeftRadius: 100,
  width: '30%',
  height: '9.75em',
  boxShadow: 'none',
  background: 'white',
  position: 'absolute',
  right: '2%'
})

export default function Root(){
  let { state, dispatch } = useContext(store)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Canvas>
            <Spline />
            <Wrapper>
              <Pie/>
            </Wrapper>
          </Canvas>
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

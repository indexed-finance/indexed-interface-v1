import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'

import indexed from '../assets/images/indexed.png'

import { store } from '../state'

const Container = styled(Paper)({
  padding: '1em 2em',
  border: '3px solid #666666',
  borderRadius: 10,
  margin: '2.5em 3em',
  '& header': {
    marginTop: '-2em',
    background: 'white',
    padding: '0em 1em 0em 1em',
    width: '7.5%',
  }
})

const Cell = styled(Paper)({
  padding: '1em 2em',
  border: '2px solid #999999',
  borderRadius: 10,
  margin: '1em 0em'
})


export default function Root(){
  let { state, dispatch } = useContext(store)

  return (
    <Fragment>
      <Container />
      <Container>
        <header>
          <Typography variant='h5'> Markets </Typography>
        </header>
        <Cell elevation={2}> Cryptocurrency Index [CCII] </Cell>
        <Cell elevation={2}> DeFi Index [DEFII] </Cell>
      </Container>
    </Fragment>
  )
}

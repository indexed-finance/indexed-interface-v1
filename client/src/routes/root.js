import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

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

const Trigger = styled(Button)({
  border: '3px solid #999999',
  color: '#999999',
  borderRadius: 10,
  padding: '.2em 2em',
  marginTop: '7.5px',
  marginLeft: 'auto',
  float: 'right',
  overflow: 'auto'
})


const Wrapper = styled(Paper)({
  borderLeft: '5px solid #666666',
  borderRight: '3px solid #666666',
  borderTop: '3px solid #666666',
  borderBottom: '3px solid #666666',
  borderTopLeftRadius: 100,
  borderBottomLeftRadius: 100,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
  width: '30%',
  height: '11em',
  boxShadow: 'none',
  background: 'white',
  position: 'absolute',
  marginTop: '-.2em',
  right: '2%'
})

export default function Root(){
  let { state, dispatch } = useContext(store)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Canvas>
            <div className='market-select'>
              <h2> Cryptocurrency Index [CCI]</h2>
              <h3> $5,232.34 </h3>
            </div>
            <Spline />
            <Wrapper>
              <Pie/>
              <ul className='market-options'>
                <li>Address: <span>0x42...4311</span> </li>
                <li>Supply: <span>1,000,232</span> </li>
                <li>Outflow: <span>$5,232,100 </span> </li>
                <li>Inflow: <span>$3,102,531</span></li>
                <li>TVL: <span>$10,023,021</span></li>
                <Trigger> Explore </Trigger>
              </ul>
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

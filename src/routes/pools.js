import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import randomColor from 'randomcolor'

import Container from '../components/container'
import List from '../components/list'
import Donut from '../components/charts/donut'

import { store } from '../state'

const columns = [
  {
    id: 'symbol',
    label: 'SYMBOL',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'hex',
    label: 'ADDRESS',
    minWidth: 100,
    align: 'center'
  },
  {
    id: 'marketcap',
    label: 'MARKETCAP',
    minWidth: 100,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}`,
  },
  {
    id: 'action',
    minWidth: 600,
    align: 'right',
  },
]

const useStyles = makeStyles((theme) => ({
  container: {
    paddingRight: 37.5,
    paddingLeft: 37.5
  }
}))

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

export default function Pools(){
  const [ pools, setPools ] = useState({})
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  useEffect(() => {
    let newPools = state.indexes

    if(Object.keys(newPools).length > 0){
      Object.entries(newPools).map(i => {
        i[1].hex = `${i[1].address.substring(0, 6)}...${i[1].address.substring(38, 64)}`
      }, setPools(newPools))
    }
  }, [ state.indexes ])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='center' justify='center'>
        <Grid item>
          <Container margin="3em 3em" padding="1em 2em" title="POOLS" percentage="10%">
            <div className={classes.container}>
              <List data={Object.values(pools)}
                props={state.indexes}
                action={Donut}
                columns={columns}
                height='100%'
              />
            </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

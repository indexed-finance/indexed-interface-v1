import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import {Loader} from 'react-loaders'
import Grid from '@material-ui/core/Grid'

import 'loaders.css'

const useStyles = makeStyles(() => ({
  container: {
    paddingTop: '50vh',
  }
}))

export default function LoadingAnimation(){
  const classes = useStyles()

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item>
        <div className={classes.container}>
          <Loader size="Large" color="#66FFFF" type="line-scale-pulse-out-rapid" active />
        </div>
      </Grid>
    </Grid>
  )
}

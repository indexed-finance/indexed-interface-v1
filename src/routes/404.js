import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles(() => ({
  container: {
    paddingTop: '75%'
  }
}))

export default function Error404() {
  const classes = useStyles()

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item>
        <div className={classes.container}>
          <h2> 404, NO PAGE FOUND.</h2>
        </div>
      </Grid>
    </Grid>
  )
}

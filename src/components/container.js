import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { styled, useTheme, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    border: '3px solid #666666',
    borderRadius: 10,
    color: theme.palette.secondary.main,
    '& header': {
      marginTop: '-2em',
      marginLeft: '1em',
      background: theme.palette.primary.main,
      padding: '0em 1em 0em 1em',
      width: 'fit-content',
      fontFamily: 'San Francisco Bold',
      letterSpacing: 3,
    }
  },
}));

export default function Container({ padding, children, margin, title }){
  const theme = useTheme()
  let marginLeft = padding == '1em 0em' ? 25 : 0
  const classes = useStyles()

  return(
    <Paper className={classes.root} style={{ marginLeft, padding, margin }}>
      <header>
        <Typography variant='h5'> {title} </Typography>
      </header>
      {children}
    </Paper>
  )
}

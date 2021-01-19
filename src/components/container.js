import React from "react";

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { styled, useTheme, makeStyles } from '@material-ui/core/styles'

import { useTranslation } from 'react-i18next'

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
  let marginLeft = padding == '1em 0em' ? 25 : 0
  const classes = useStyles()
  const { t } = useTranslation()

  return(
    <Paper className={classes.root} style={{ marginLeft, padding, margin }}>
      <header>
        <Typography variant='h5'> {t('indexPool', {msg:title})} </Typography>
      </header>
      {children}
    </Paper>
  )
}

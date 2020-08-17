import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    background: 'white',
    color: '#999999',
    borderBottom: 'solid 3px #999999',
    boxShadow: 'none',
    padding: spacing(1, 0),
  },
  menuButton: {
    marginRight: spacing(1),
  },
  title: {
    marginLeft: spacing(1),
    fontWeight: 350,
    flexGrow: 1,
  },
  search: {
    background: 'rgba(0, 0, 0, 0.075)',
  }
}))

export default function ButtonAppBar() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar} position="static">
        <Toolbar>
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item>
              <Typography variant='h6' className={classes.title}> INDEXED </Typography>
            </Grid>
            <Grid item>
              <TextField size='small' className={classes.search} placeholder='Search...' variant='outlined' />
            </Grid>
            <Grid item>
              <IconButton className={classes.menuButton}>
                <MenuIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

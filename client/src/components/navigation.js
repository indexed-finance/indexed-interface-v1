import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid'
import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'

import indexed from '../assets/images/indexed.png'

const Field = styled(TextField)({
  '& fieldset': {
   background: 'rgba(0, 0, 0, 0.075)',
   borderWidth: 2,
   borderRadius: 10,
  },
  '& input': {
    paddingLeft: '5px',
  }
})

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Fransico',
  },
  appBar: {
    background: 'white',
    color: '#666666',
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    padding: spacing(1.25,0),
  },
  menuButton: {
    marginRight: spacing(1),
  },
  title: {
    fontFamily: 'San Francisco Bold',
    marginLeft: spacing(2),
    marginTop: spacing(.375),
    letterSpacing: 5,
    flexGrow: 1,
    float: 'right',
  },
  logo: {
    width: 35,
    marginLeft: spacing(1),
  },
  search: {
    '&:hover fieldset': {
      borderColor: '#666666 !important',
    },
    '& label': {
      color: 'white',
    },
    '& label.Mui-focused': {
      color: 'white',
    },
    '& input:valid + fieldset': {
      borderWidth: 2,
    },
    '& input:invalid + fieldset': {
      borderColor: 'red',
      borderWidth: 2,
    },
    '& input:valid:focus + fieldset': {
      borderWidth: 2,
      paddingRight: '5px !important',
      paddingLeft: '8px !important',
    }
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
              <img className={classes.logo} src={indexed} />
              <Typography variant='h5' className={classes.title}> INDEXED </Typography>
            </Grid>
            <Grid item>
              <Field size='small' className={classes.search} placeholder='Search...' variant='outlined'
                InputProps={{
                  startAdornment:
                  <InputAdornment position="start">
                    <SearchIcon color='secondary' />
                  </InputAdornment>
                }}
              />
            </Grid>
            <Grid item>
              <IconButton className={classes.menuButton}>
                <MenuIcon iconStyle={{ width: 50 }} color='secondary'/>
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

import React, { Fragment, useContext, useState } from 'react'

import { Link } from 'react-router-dom'
import makeBlockie from 'ethereum-blockies-base64'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import { toChecksumAddress } from '../assets/constants/functions'
import indexed from '../assets/images/indexed.png'
import getWeb3 from '../utils/getWeb3'
import Search from './inputs/search'

import { store } from '../state'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Fransico',
  },
  href: {
    color: '#333333 !important',
    textDecoration: 'none !important',
  },
  appBar: {
    background: 'white',
    color: '#666666',
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    padding: spacing(2,0)
  },
  menuButton: {
    marginRight: spacing(1)
  },
  title: {
    fontFamily: 'San Francisco Bold',
    marginLeft: spacing(2),
    marginTop: spacing(1),
    letterSpacing: 5,
    flexGrow: 1,
    float: 'right',
    color: '#333333'
  },
  logo: {
    width: 50,
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
  },
  blockie: {
    border: 'solid 3px #666666',
    borderRadius: 25,
    backgroundClip: 'content-box',
    width: 35
  },
  profile: {
    paddingTop: 5,
    float: 'left',
    paddingRight: 10,
    '& span': {
      fontFamily: 'San Francisco',
      float: 'left',
      textAlign: 'left',
      paddingRight: 25,
      paddingTop: 10
    }
  }
}))

export default function ButtonAppBar() {
  const [ component, setComponent ] = useState(<Fragment/>)
  const [ menuItems, setItems ] = useState(<LoggedOut />)
  const [ anchorEl, setAnchorEl ] = useState(null)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const connectWeb3 = async() => {
    const web3 = await getWeb3()

    let accounts = await web3.eth.getAccounts()
    let network = await web3.eth.net.getId()
    let account = toChecksumAddress(accounts[0])

    setComponent(<Blockie address={account} />)
    setItems(<LoggedIn />)

    dispatch({
      type: 'WEB3',
      payload: {
        web3, account, network
      }
    })
  }

  function Blockie({ address }) {
    return(
      <div className={classes.profile}>
        <span>{address.substring(0, 6)}...{address.substring(38, 64)}</span>
        <a target='_blank' href={`https://etherscan.io/address/${address}`}>
          <img src={makeBlockie(address)} className={classes.blockie} />
        </a>
      </div>
    )
  }

  function LoggedOut() {
    return(
      <Fragment>
        <Link className={classes.href} onClick={connectWeb3}>
          <MenuItem>CONNECT WALLET</MenuItem>
        </Link>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
        <Link className={classes.href} to='/demo' onClick={handleClose}>
          <MenuItem>DEMO</MenuItem>
        </Link>
      </Fragment>
    )
  }

  function LoggedIn() {
    return(
      <Fragment>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
        <Link className={classes.href} to='/demo' onClick={handleClose}>
          <MenuItem>DEMO</MenuItem>
        </Link>
      </Fragment>
    )
  }

  return (
    <div className={classes.root}>
      <AppBar className={classes.appBar} position="static">
        <Toolbar>
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item>
              <Link to='/'>
                <img className={classes.logo} src={indexed} />
                <Typography variant='h4' className={classes.title}> INDEXED </Typography>
              </Link>
            </Grid>
            <Grid item>
              <Search selections={state.indexes} />
            </Grid>
            <Grid item>
              {component}
              <IconButton onClick={handleClick} className={classes.menuButton}>
                <MenuIcon color='secondary'/>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
               {menuItems}
             </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

import React, { Fragment, useContext, useState, useEffect, useRef } from 'react'

import { Link } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
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
import NightsStayIcon from '@material-ui/icons/NightsStay';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import jazzicon from '@metamask/jazzicon'

import { toChecksumAddress } from '../assets/constants/functions'
import indexed from '../assets/images/indexed.png'
import getWeb3 from '../utils/getWeb3'
import Search from './inputs/search'

import { store } from '../state'

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Fransico',
  },
  href: {
    color: `${palette.secondary.main} !important`,
    textDecoration: 'none !important',
  },
  menu: {
    position: 'absolute'
  },
  appBar: {
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    padding: spacing(2,0),
    background: palette.primary.main,
    color: palette.secondary.main
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
    color: palette.secondary.main
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
      color: palette.secondary.main
    },
    '& label.Mui-focused': {
      color: palette.secondary.main
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
  profile: {
    float: 'right',
    paddingTop: 2.5,
    marginLeft: 15
  }
}))


export default function Navigation({ mode }) {
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
    let classes = useStyles()

    useEffect(() => {
      let element = document.getElementById('blockie')
      let parsed =  parseInt(address.slice(2, 10), 16)
      let blockie = jazzicon(35, parsed)

      blockie.style.float = 'right'
      blockie.style.borderRadius = '25px'
      blockie.style.border = '3px solid #666666'

      element.appendChild(blockie)
    }, [])

    return(
      <div className={classes.profile}>
        <a target='_blank' href={`https://etherscan.io/address/${address}`}>
          <div id="blockie" />
        </a>
      </div>
    )
  }

  function LoggedOut() {
    const classes = useStyles()

    return(
      <Fragment>
        <Link className={classes.href} onClick={connectWeb3}>
          <MenuItem>CONNECT WALLET</MenuItem>
        </Link>
        <Link className={classes.href} to='/propose' onClick={handleClose}>
          <MenuItem>CREATE PROPOSAL</MenuItem>
        </Link>
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
        <Link className={classes.href} to='/pools' onClick={handleClose}>
          <MenuItem>POOLS</MenuItem>
        </Link>
      </Fragment>
    )
  }

  function LoggedIn() {
    const classes = useStyles()

    return(
      <Fragment>
        <Link className={classes.href} to='/propose' onClick={handleClose}>
          <MenuItem>CREATE PROPOSAL</MenuItem>
        </Link>
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
        <Link className={classes.href} to='/pools' onClick={handleClose}>
          <MenuItem>POOLS</MenuItem>
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
              <div className={classes.menu}>
                <Menu
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  getContentAnchorEl={null}
                >
                  {menuItems}
                </Menu>
              </div>
              <IconButton onClick={handleClick} className={classes.menuButton}>
                <MenuIcon color='secondary'/>
              </IconButton>
              <IconButton onClick={() => state.changeTheme(mode)}>
                {mode && (<Brightness4Icon color='secondary' />)}
                {!mode && (<NightsStayIcon color='secondary' />)}
              </IconButton>
             {component}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

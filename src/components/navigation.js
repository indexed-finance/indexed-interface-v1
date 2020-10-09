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
import { useLocation } from 'react-router-dom'
import jazzicon from '@metamask/jazzicon'

import { toChecksumAddress } from '../assets/constants/functions'
import indexed from '../assets/images/indexed.png'
import getWeb3 from '../utils/getWeb3'
import getStyles from '../assets/css'
import Search from './inputs/search'

import { store } from '../state'

const useStyles = getStyles('navigation')

export default function Navigation({ mode }) {
  const [ component, setComponent ] = useState(<Fragment/>)
  const [ display, setDisplay ] = useState(<Fragment />)
  const [ login, setLogin ] = useState(false)
  const [ anchorEl, setAnchorEl ] = useState(null)
  const location = useLocation()
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
    setAnchorEl(null)
    setLogin(true)

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
      let element = document.getElementById('profile-blockie')
      let parsed =  parseInt(address.slice(2, 10), 16)
      let blockie = jazzicon(35, parsed)

      blockie.style.float = 'right'
      blockie.style.borderRadius = '25px'
      blockie.style.border = '3px solid #666666'

      element.appendChild(blockie)
    }, [])

    return(
        <a target='_blank' href={`https://etherscan.io/address/${address}`}>
          <div id="profile-blockie" />
        </a>
    )
  }

  const changeTheme = () => {
    state.changeTheme(mode)
    setAnchorEl(null)
  }

  function LoggedOut() {
    const classes = useStyles()

    return(
      <Fragment>
        <Link className={classes.href} onClick={connectWeb3}>
          <MenuItem>CONNECT WALLET</MenuItem>
        </Link>
        {state.native && (
          <Link className={classes.href} onClick={changeTheme}>
            <MenuItem>LIGHT/DARK MODE</MenuItem>
          </Link>
        )}
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
      </Fragment>
    )
  }

  function LoggedIn({ trigger }) {
    const classes = useStyles()

    return(
      <Fragment>
        <Link className={classes.href} to='/propose' onClick={handleClose}>
          <MenuItem>CREATE PROPOSAL</MenuItem>
        </Link>
        {state.native && (
          <Link className={classes.href} onClick={changeTheme}>
            <MenuItem>LIGHT/DARK MODE</MenuItem>
          </Link>
        )}
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/markets' onClick={handleClose}>
          <MenuItem>MARKETS</MenuItem>
        </Link>
      </Fragment>
    )
  }

  let marginLeft = !state.native ? 15: 0

  return (
    <div>
    { location.pathname != '/' && (
      <div className={classes.root}>
      <AppBar className={classes.appBar} position="fixed">
        <Toolbar>
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item>
              <Link to='/'>
                <img className={classes.logo} src={indexed} />
                <Typography variant={!state.native ? 'h4' : 'h5' } className={classes.title}> INDEXED </Typography>
              </Link>
            </Grid>
            {!state.native && (
              <Grid item>
                <Search selections={state.indexes} />
              </Grid>
            )}
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
                  {login && (<LoggedIn />)}
                  {!login && (<LoggedOut />)}
                </Menu>
              </div>
              <IconButton onClick={handleClick} className={classes.menuButton}>
                <MenuIcon color='secondary'/>
              </IconButton>
              {!state.native && (
                <IconButton onClick={() => state.changeTheme(mode)}>
                  {mode && (<Brightness4Icon color='secondary' />)}
                  {!mode && (<NightsStayIcon color='secondary' />)}
                </IconButton>
              )}
              <div className={classes.profile} style={{ marginLeft }}>
                {component}
              </div>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
   )}
  {location.pathname == '/' && (<Fragment />)}
  </div>
 )
}

import React, { Fragment, useContext, useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NightsStayIcon from '@material-ui/icons/NightsStay';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import RemoveCircleOutlinedIcon from '@material-ui/icons/RemoveCircleOutlined';

import jazzicon from '@metamask/jazzicon'

import { toChecksumAddress, isAddress } from '../assets/constants/functions'
import { WEB3_PROVIDER, INCORRECT_NETWORK } from '../assets/constants/parameters'
import ndxLight from '../assets/images/indexed-light.png'
import ndxDark from '../assets/images/indexed-dark.png'
import style from '../assets/css/components/navigation'
import { getCachedWeb3, getWeb3, clearCachedWeb3 } from '../utils/getWeb3'
import getStyles from '../assets/css'

import { store } from '../state'
import { useWeb3 } from '../hooks/useWeb3'

const useStyles = getStyles(style)

export default function Navigation({ mode }) {
  const [ component, setComponent ] = useState(null)
  const [ anchorEl, setAnchorEl ] = useState(null)
  const [didCheckCache, setDidCheckCache] = useState(false);
  const classes = useStyles();

  const { loggedIn, account, handleSetWeb3, connectWeb3, disconnectWeb3 } = useWeb3();

  let { state, dispatch } = useContext(store)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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
      blockie.style.marginTop = '5px'

      element.appendChild(blockie)
    }, [ ])

    return(
      <Fragment>
        <a target='_blank' rel="noopener noreferrer" href={`https://etherscan.io/address/${address}`}>
          <div id='profile-blockie' />
        </a>
        <IconButton onClick={disconnectWeb3} className={classes.logout}>
          <RemoveCircleOutlinedIcon color='secondary' />
        </IconButton>
     </Fragment>
    )
  }

  useEffect(() => {
    if (didCheckCache) return;
    (async () => {
      const web3 = await getCachedWeb3();
      setDidCheckCache(true);
      if (!web3) return;
      await handleSetWeb3(web3);
    })();
  });

  const changeTheme = () => {
    state.changeTheme(mode)
    setAnchorEl(null)
  }

  function LoggedOut() {
    const classes = useStyles()

    return(
      <Fragment>
        {state.native && (
          <Link className={classes.href} onClick={changeTheme}>
            <MenuItem>LIGHT/DARK MODE</MenuItem>
          </Link>
        )}
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <a href='https://docs.indexed.finance' target='_blank' className={classes.href}>
          <MenuItem>DOCS</MenuItem>
        </a>
        <Link className={classes.href} to='/stake' onClick={handleClose}>
          <MenuItem>STAKE</MenuItem>
        </Link>
      </Fragment>
    )
  }

  function LoggedIn() {
    const classes = useStyles()

    return(
      <Fragment>
        {state.native && (
          <Link className={classes.href} onClick={changeTheme}>
            <MenuItem>LIGHT/DARK MODE</MenuItem>
          </Link>
        )}
        <Link className={classes.href} to='/categories' onClick={handleClose}>
          <MenuItem>CATEGORIES</MenuItem>
        </Link>
        <Link className={classes.href} to='/governance' onClick={handleClose}>
          <MenuItem>GOVERNANCE</MenuItem>
        </Link>
        <Link className={classes.href} to='/portfolio' onClick={handleClose}>
            <MenuItem>PORTFOLIO</MenuItem>
        </Link>
          <a href='https://docs.indexed.finance' target='_blank' className={classes.href}>
          <MenuItem>DOCS</MenuItem>
        </a>
        <Link className={classes.href} to='/stake' onClick={handleClose}>
          <MenuItem>STAKE</MenuItem>
        </Link>
      </Fragment>
    )
  }

  useEffect(() => {
    if(account && isAddress(account) && !component){
      setComponent(<Blockie address={account} />)
    } else {
      setComponent(null)
    }
  }, [ account ])

  let { marginLeft, display, width, paddingTop, padding, logoMargin, titleMargin, marginBottom } = style.getFormatting(state.native)

  return (
    <div>
      <div className={classes.root} style={{ marginBottom }}>
      <AppBar className={classes.appBar} position="fixed" style={{ ...padding }}>
        <Toolbar>
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item style={{ marginTop: !state.native ? -6.75 : -3 }}>
              <Link to='/'>
                {mode && (<img alt='logo' className={classes.logo} style={{ marginTop: logoMargin, width, paddingTop }} src={ndxDark} />)}
                {!mode && (<img alt='logo' className={classes.logo} style={{ marginTop: logoMargin, width, paddingTop }} src={ndxLight} />)}
                <Typography variant={!state.native ? 'h4' : 'h5' } className={classes.title} style={{ marginLeft: titleMargin }}> {display} </Typography>
              </Link>
            </Grid>
              {!state.native && (
                <Grid item className={classes.nav}>
                  <Link to='/governance' className={classes.href}>
                    <h3> GOVERNANCE </h3>
                  </Link>
                  <Link to='/categories' className={classes.href}>
                    <h3> CATEGORIES </h3>
                  </Link>
                  <Link to='/stake' className={classes.href}>
                    <h3> STAKE </h3>
                  </Link>
                  {state.account && (
                    <Link to='/portfolio' className={classes.href}>
                        <h3> PORTFOLIO </h3>
                    </Link>
                  )}
                  <a href='https://docs.indexed.finance' target='_blank' className={classes.href}>
                    <h3> DOCS </h3>
                  </a>
                </Grid>
              )}
              <Grid item>
                {!state.native && (
                  <IconButton className={classes.iconButton} onClick={() => state.changeTheme(mode)}>
                    {mode && (<Brightness4Icon color='secondary' />)}
                    {!mode && (<NightsStayIcon color='secondary' />)}
                  </IconButton>
                )}
                {state.native && (
                  <Fragment>
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
                     >
                      {loggedIn && (<LoggedIn />)}
                      {!loggedIn && (<LoggedOut />)}
                    </Menu>
                  </div>
                  <IconButton
                  onClick={handleClick} className={classes.menuButton}>
                    <MenuIcon color='secondary'/>
                  </IconButton>
                </Fragment>
                )}
                <div className={classes.profile} style={{ marginLeft }}>
                  {(!state.web3.injected || !account) && (
                    <IconButton onClick={connectWeb3}>
                      <AccountBalanceWalletIcon color='secondary' />
                    </IconButton>
                  )}
                  {account && component}
                </div>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  </div>
 )
}

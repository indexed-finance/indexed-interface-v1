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

import { useLocation } from 'react-router-dom'
import jazzicon from '@metamask/jazzicon'
import { getAllHelpers } from '@indexed-finance/indexed.js';

import { toChecksumAddress } from '../assets/constants/functions'
import { WEB3_PROVIDER, INCORRECT_NETWORK } from '../assets/constants/parameters'
import ndxLight from '../assets/images/indexed-light.png'
import ndxDark from '../assets/images/indexed-dark.png'
import style from '../assets/css/components/navigation'
import { getCachedWeb3, getWeb3 } from '../utils/getWeb3'
import getStyles from '../assets/css'

import { store } from '../state'

const useStyles = getStyles(style)

export default function Navigation({ mode }) {
  const [ component, setComponent ] = useState(<Fragment/>)
  const [ display, setDisplay ] = useState(<Fragment />)
  const [ login, setLogin ] = useState(false)
  const [ anchorEl, setAnchorEl ] = useState(null)
  const [ logo, setLogo ] = useState(<img />)
  const [didCheckCache, setDidCheckCache] = useState(false);
  const location = useLocation()
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSetWeb3 = async (web3) => {
    let accounts = await web3.eth.getAccounts();
    let account = toChecksumAddress(accounts[0]);
    let network = await web3.eth.net.getId();
    let helper = await getAllHelpers(web3, account)
    if((+network) !== 4){
      dispatch({ type: 'MODAL', payload: INCORRECT_NETWORK })
    } else {
      setComponent(<Blockie address={account} />)
      setAnchorEl(null)
      setLogin(true)
      dispatch({ type: 'WEB3', payload: { web3, account, network, helper } });
    }
  }

  useEffect(() => {
    (async () => {
      if (didCheckCache) return;
      const web3 = await getCachedWeb3();
      setDidCheckCache(true);
      if (!web3) return;
      await handleSetWeb3(web3);
    })();
  })

  const connectWeb3 = async() => {
    try {
      const web3 = await getWeb3();
      await handleSetWeb3(web3);
    } catch (e) {
      dispatch({ type: 'FLAG', payload: WEB3_PROVIDER })
    }
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
        <Link className={classes.href} to='/stake' onClick={handleClose}>
          <MenuItem>STAKE</MenuItem>
        </Link>
      </Fragment>
    )
  }

  let marginLeft = !state.native ? 15: 0

  useEffect(() => {
    let image = mode ? ndxDark : ndxLight;
    setLogo(<img className={classes.logo} src={image} />);
  }, [])

  return (
    <div>
    { location.pathname !== '/' && (
      <div className={classes.root}>
      <AppBar className={classes.appBar} position="fixed">
        <Toolbar>
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item>
              <Link to='/'>
                {mode && (<img className={classes.logo} style={{ width: !state.native ? 40 : 30,  paddingTop: !state.native ? '.75vh': '1.5vh' }} src={ndxDark} />)}
                {!mode && (<img className={classes.logo} style={{ width: !state.native ? 40 : 30, paddingTop: !state.native ? '.75vh': '1.5vh'}} src={ndxLight} />)}
                <Typography variant={!state.native ? 'h4' : 'h5' } className={classes.title}> INDEXED </Typography>
              </Link>
            </Grid>
              {!state.native && (
                <Grid item style={{ display: 'inline-flex', marginLeft: 'auto' }}>
                  <Link to='/governance' className={classes.href}>
                    <h3> GOVERNANCE </h3>
                  </Link>
                  <Link to='/markets' className={classes.href}>
                    <h3> MARKETS </h3>
                  </Link>
                  <Link to='/stake' className={classes.href}>
                    <h3> STAKE </h3>
                  </Link>
                </Grid>
              )}
              {state.native && (
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
                   >
                    {login && (<LoggedIn />)}
                    {!login && (<LoggedOut />)}
                  </Menu>
                </div>
                <IconButton onClick={handleClick} className={classes.menuButton}>
                  <MenuIcon color='secondary'/>
                </IconButton>
              </Grid>
              )}
              <Grid item>
                {!state.native && (
                  <IconButton style={{ marginLeft: 50 }} onClick={() => state.changeTheme(mode)}>
                    {mode && (<Brightness4Icon color='secondary' />)}
                    {!mode && (<NightsStayIcon color='secondary' />)}
                  </IconButton>
                )}
                <div className={classes.profile} style={{ marginLeft }}>
                  {!state.web3.injected && !state.native && (
                    <IconButton onClick={connectWeb3}>
                      <AccountBalanceWalletIcon color='secondary' />
                    </IconButton>
                  )}
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

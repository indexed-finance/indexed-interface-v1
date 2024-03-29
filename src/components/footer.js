import React, { useEffect, useState, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { useLocation } from 'react-router-dom'

import style from '../assets/css/components/footer'

import discord from '../assets/images/discord.png'
import github from '../assets/images/github.png'
import medium from '../assets/images/medium.png'
import twitter from '../assets/images/twitter.png'
import discourse from '../assets/images/discourse.png'
import snapshot from '../assets/images/snapshot.png'
import defipulse from '../assets/images/defi-pulse.png'
import { store } from '../state'

import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function Footer() {
  const [ margin, setMargin ] = useState(0)
  const location = useLocation()
  const classes = useStyles()

  let { state } = useContext(store)

  useEffect(() => {
    let { marginTop } = style.getFormatting(state.native)

    if(margin == 0 || margin != marginTop[location.pathname.split('/')[1]]){
      setMargin(marginTop[location.pathname.split('/')[1]])
    }
  }, [ state.native, location.pathname ])

  return(
    state.load && <div className={classes.root} style={{ marginTop: margin }} >
      <Grid container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item style={{ marginBottom: state.native ? 15 : 0 }}>
         <div className={classes.copyright}> ALL RIGHTS RESERVED. INDEXED 2021 </div>
        </Grid>
        <Grid item>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://gov.indexed.finance" target='_blank'>
            <img alt='snapshot' src={snapshot} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://forum.indexed.finance" target='_blank'>
            <img alt='discourse' src={discourse} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://twitter.com/ndxfi" target='_blank'>
            <img alt='twitter' src={twitter} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://discord.gg/jaeSTNPNt9" target='_blank'>
            <img alt='discord' src={discord} />
          </a>
          <a className={classes.logo} rel="noopener noreferrer" href="https://ndxfi.medium.com" target='_blank'>
            <img alt='medium' src={medium} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://github.com/indexed-finance" target='_blank'>
            <img alt='github' src={github} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://defipulse.com" target='_blank'>
            <img alt='github' src={defipulse} />
          </a>
        </Grid>
      </Grid>
    </div>
  )
}

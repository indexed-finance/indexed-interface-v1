import React, { useEffect, useState } from 'react'

import Grid from '@material-ui/core/Grid'
import { useLocation } from 'react-router-dom'

import style from '../assets/css/components/footer'

import discord from '../assets/images/discord.png'
import github from '../assets/images/github.png'
import medium from '../assets/images/medium.png'
import twitter from '../assets/images/twitter.png'

import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function Footer({ native }) {
  const [ margin, setMargin ] = useState(0)
  const location = useLocation()
  const classes = useStyles()

  let path = location.pathname

  useEffect(() => {
    let { marginTop } = style.getFormatting(native)

    if(margin != marginTop[path.split('/')[1]]){
      setMargin(marginTop[path.split('/')[1]])
    }
  }, [ path ])

  return(
    <div className={classes.root} style={{ marginTop: margin }} >
      <Grid container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item>
         <div className={classes.copyright}> All Rights Reserved. INDEXED 2020 </div>
        </Grid>
        <Grid item>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://twitter.com/indexedfi" target='_blank'>
            <img alt='twitter' src={twitter} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://discord.com" target='_blank'>
            <img alt='discord' src={discord} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://medium.com" target='_blank'>
            <img alt='medium' src={medium} />
          </a>
          <a className={classes.logo}  rel="noopener noreferrer" href="https://github.com/indexed-finance" target='_blank'>
            <img alt='github' src={github} />
          </a>
        </Grid>
      </Grid>
    </div>
  )
}

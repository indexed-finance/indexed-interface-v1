import React from 'react'

import Grid from '@material-ui/core/Grid'

import style from '../assets/css/components/footer'

import discord from '../assets/images/discord.png'
import github from '../assets/images/github.png'
import twitter from '../assets/images/twitter.png'

import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function Footer({ native }) {
  const classes = useStyles()

  let { marginTop } = style.getFormatting(native)

  return(
    <div className={classes.root} style={{ marginTop }}>
      <Grid container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item>
         <div className={classes.copyright}> All Rights Reserved. INDEXED 2020 </div>
        </Grid>
        <Grid item>
          <label className={classes.logo}>
            <img alt='twitter' src={twitter} />
          </label>
          <label className={classes.logo}>
            <img alt='discord' src={discord} />
          </label>
          <label className={classes.logo}>
            <img alt='github' src={github} />
          </label>
        </Grid>
      </Grid>
    </div>
  )
}

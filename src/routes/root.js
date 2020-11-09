import React, { Fragment, useEffect, useContext, useState } from 'react'

import { Link, useHistory } from 'react-router-dom'
import { renderCanvas, stopRender } from '../utils/canvas'
import { styled } from '@material-ui/core/styles'
import { store } from '../state'
import Grid from '@material-ui/core/Grid'

import ndxDark from '../assets/images/indexed-dark.png'
import ndxLight from '../assets/images/indexed-light.png'
import eth from '../assets/images/eth.png'
import mkr from '../assets/images/mkr.png'
import dai from '../assets/images/dai.png'
import wbtc from '../assets/images/wbtc.png'
import comp from '../assets/images/comp.png'
import busd from '../assets/images/busd.png'
import knc from '../assets/images/knc.png'
import link from '../assets/images/link.png'
import ampl from '../assets/images/ampl.png'
import bal from '../assets/images/bal.png'
import snx from '../assets/images/snx.png'
import yfi from '../assets/images/yfi.png'
import usdt from '../assets/images/usdt.png'
import crv from '../assets/images/crv.png'
import usdc from '../assets/images/usdc.png'
import uni from '../assets/images/uni.png'

import style from '../assets/css/routes/root'

import ButtonPrimary from '../components/buttons/primary'

const Button = styled(ButtonPrimary)({
  background: 'inherit',
})

export default function Root(){
  const [ path, setPath ] = useState(null)
  let { state, dispatch } = useContext(store)
  let history = useHistory()

  useEffect(() => {
    renderCanvas()
  }, [ ])

  let {
    fontSize, left, width, marginRight, textWidth, secondary, float
  } = style.getFormatting(state)

  if(state.native && window.innerWidth < 400) {
    left = '5%'
    fontSize = '3.75em'
  }

  return (
    <Fragment>
    <div id="canvas">
      <nav style={{ position: 'absolute '}}>
        <ul style={{ display: 'inline-block', listStyleType: 'none', margin: 0, padding: 25, fontSize: '1.25em' }}>
          <Link onClick={stopRender} to='/markets'>
            <li style={{ float: 'left',  marginRight: 25 }}> MARKETS </li>
          </Link>
          <Link onClick={stopRender}>
            <li style={{ float: 'left', marginRight: 25}}> DOCS </li>
          </Link >
          <Link onClick={stopRender} to='/stake'>
            <li style={{ float: 'left' }}> STAKE </li>
          </Link>
        </ul>
      </nav>
      <div style={{ fontSize: secondary, position: 'absolute', top: '35%', left }}>
        <div>
          <div style={{ float: 'left', marginTop: '-.75em', marginRight }}>
            <img src={ndxDark} id='dark' style={{ display: 'none', width }} />
            <img src={ndxLight} id='light' style={{ display: 'block', width }} />
          </div>
          <span style={{ float, fontSize }}> INDEXED </span>
        </div>
        <p style={{ float: 'right', paddingRight: 25, width: textWidth }}> A FINANCIAL MANAGEMENT PROTOCOL. </p>
        <Link onClick={stopRender} style={{ float: 'right' }} to='/markets'>
          <ButtonPrimary id='landing-button'> ENTER </ButtonPrimary>
        </Link>
      </div>
      <div class="mouse_wave">
      	<span class="scroll_arrows one"></span>
      	<span class="scroll_arrows two"></span>
      	<span class="scroll_arrows three"></span>
      </div>
    </div>
    <Grid container direction='column' alignItems='flex-start' justify='space-between'>
      <Grid item>
        <div style={{ padding: '2.5em 5em '}}>
          <p> Indexed provides an simple on-ramp to diversifying investments into any market sector.</p>
          <p> Providing a hedge against the violatile nature of crypto assets. </p>
        </div>
      </Grid>
      <Grid item container direction='row' alignItems='center' justify='center' style={{ paddingTop: '5em', paddingBottom: '5em'}}>
        <Grid item>
          <ul style={{ listStyleType: 'none'}}>
            <li> <img style={{ width: '5em' }} src={usdc} /> </li>
            <li> <img style={{ paddingLeft: '7.5em', width: '5em' }} src={eth} /> </li>
            <li> <img style={{ width: '5em' }} src={dai} /> </li>
          </ul>
        </Grid>
        <Grid item>
          <h2 style={{ margin: '2.5em'}}> {'--->'} </h2>
        </Grid>
        <Grid item>
          <ul style={{ listStyleType: 'none'}}>
            <li> <img style={{ width: '2.5em' }} src={mkr} />  </li>
            <li> <img style={{ padding: '1em', width: '2.5em' }} src={link} /> <img style={{  padding: '.75em', width: '2.5em' }} src={uni} /> </li>
            <li> <img style={{ padding: '1em', width: '2.5em' }} src={crv} />  <img style={{  width: '2.5em' }} src={bal} /> <img style={{ padding: '1em',width: '2.5em' }} src={yfi} /> </li>
            <li> <img style={{  width: '2.5em',  padding: '1em' }} src={knc} /> <img style={{ width: '2.5em' }} src={wbtc} /> </li>
            <li> <img style={{ width: '2.5em' }} src={comp} /> </li>
          </ul>
        </Grid>
      </Grid>
    </Grid>
    </Fragment>
  )
}

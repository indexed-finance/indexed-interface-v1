import React, { Fragment, useEffect, useContext, useState } from 'react'

import { Link, useHistory } from 'react-router-dom'
import { renderCanvas, stopRender } from '../utils/canvas'
import { styled } from '@material-ui/core/styles'
import { store } from '../state'
import Grid from '@material-ui/core/Grid'

import ndxDark from '../assets/images/indexed-dark.png'
import ndxLight from '../assets/images/indexed-light.png'
import style from '../assets/css/routes/root'

import ButtonPrimary from '../components/buttons/primary'

const Button = styled(ButtonPrimary)({
  background: 'inherit',
})

export default function Root(){
  let { state } = useContext(store)

  useEffect(() => {
    renderCanvas()
  }, [ ])

  let {
    fontSize, left, width, nav, marginRight, textWidth, secondary, float, indicator
  } = style.getFormatting(state)

  return (
    <div id="canvas">
      <nav style={{ position: 'absolute' }}>
        <ul style={{ display: 'inline-block', listStyleType: 'none', margin: 0, padding: 25, fontSize: nav }}>
          <Link onClick={stopRender} to='/markets'>
            <li style={{ float: 'left',  marginRight: 37.5 }}> MARKETS </li>
          </Link>
          {!state.native && (
            <Link onClick={stopRender} to='/governance'>
              <li style={{ float: 'left', marginRight: 37.5}}> GOVERNANCE </li>
            </Link >
          )}
          <Link onClick={stopRender}>
            <li style={{ float: 'left', marginRight: 37.5}}> DOCS </li>
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
        {/* <-- SCROLL DOWN INDICATOR -->
          <div class="mouse_wave" style={indicator.parent}>
      	    <span class="scroll_arrows one" style={indicator.arrows}></span>
      	    <span class="scroll_arrows two" style={indicator.arrows}></span>
            <span class="scroll_arrows three" style={indicator.arrows}></span>
          </div>
       */}
    </div>
  )
}

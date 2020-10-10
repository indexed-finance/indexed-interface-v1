import React, { useEffect, useContext } from 'react'

import { Link } from 'react-router-dom'
import { renderCanvas, stopRender } from '../utils/canvas'
import { styled } from '@material-ui/core/styles'
import { store } from '../state'

import ndxDark from '../assets/images/indexed-dark.png'
import ndxLight from '../assets/images/indexed-light.png'

import ButtonPrimary from '../components/buttons/primary'

const Button = styled(ButtonPrimary)({
  background: 'inherit',
})

export default function Root(){
  let { state } = useContext(store)

  useEffect(() => {
    renderCanvas()
  }, [ ])

  let fontSize = !state.native ? '6em' : '3.5em'
  let left = !state.native ? '40%' : '7.5%'
  let width = !state.native ? '6.5em' : '4.5em'
  let marginRight = !state.native ? '2.5em': '1em'
  let textWidth = !state.native ? '75%': 'auto'

  let secondary = !state.native ? '1em' : '.9em'
  let float = !state.native ? 'right' : 'auto'
  if(state.native && window.innerWidth < 400) {

    left = '5%'
    fontSize = '3.75em'
  }

  return (
    <div id="canvas">
      <nav style={{ position: 'absolute '}}>
        <ul style={{ display: 'inline-block', listStyleType: 'none', margin: 0, padding: 25, fontSize: '1.25em' }}>
          <Link onClick={stopRender}>
            <li style={{ float: 'left', marginRight: 25}}> ABOUT </li>
          </Link >
          <Link onClick={stopRender} to='/markets'>
            <li style={{ float: 'left',  marginRight: 25 }}> MARKETS </li>
          </Link>
          <Link onClick={stopRender} to='/swap'>
            <li style={{ float: 'left' }}> SWAP </li>
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
  )
}

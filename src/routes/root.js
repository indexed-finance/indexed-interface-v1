import React, { useEffect, useContext } from 'react'

import { Link } from 'react-router-dom'
import { renderCanvas, stopRender } from '../utils/canvas'
import { styled } from '@material-ui/core/styles'
import { store } from '../state'

import ButtonPrimary from '../components/buttons/primary'

const Button = styled(ButtonPrimary)({
  background: 'inherit',
})

export default function Root(){
  let { state } = useContext(store)

  useEffect(() => {
    renderCanvas()
  }, [ ])

  let fontSize = !state.native ? '7.5em' : '5em'
  let left = !state.native ? '40%' : '7.5%'

  let secondary = !state.native ? '1em' : '.9em'

  if(state.native && window.innerWidth < 400) {
    left = '6.75%'
    fontSize = '4em'
  }

  return (
    <div id="canvas">
      <div id='landing-main' style={{ fontSize: secondary, position: 'absolute', top: '35%', left }}>
        <span style={{ fontSize }}> INDEXED </span>
        <p> A FINANCIAL MANAGEMENT PROTOCOL. </p>
        <Link to='/markets' onClick={stopRender}>
          <ButtonPrimary id='landing-button'> ENTER </ButtonPrimary>
        </Link>
      </div>
    </div>
  )
}

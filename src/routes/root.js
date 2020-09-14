import React, { useEffect } from 'react'

import { Link } from 'react-router-dom'
import { renderCanvas, stopRender } from '../utils/canvas'
import { styled } from '@material-ui/core/styles'

import ButtonPrimary from '../components/buttons/primary'

const Button = styled(ButtonPrimary)({
  background: 'inherit',
})

export default function Root(){

  useEffect(() => {
    renderCanvas()
  }, [ ])

  return (
    <div id="canvas">
      <div id='landing-main' style={{ position: 'absolute', top: '35%', left: '40%'}}>
        <span style={{ 'font-size': '7.5em'}}> INDEXED </span>
        <p> A FINANCIAL MANAGEMENT PROTOCOL. </p>
        <Link to='/markets' onClick={stopRender}>
          <ButtonPrimary> ENTER </ButtonPrimary>
        </Link>
      </div>
    </div>
  )
}

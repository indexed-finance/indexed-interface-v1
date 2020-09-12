import React, { useEffect } from 'react'

import { renderCanvas } from '../utils/canvas'

export default function Root(){

  useEffect(() => {
    renderCanvas()
  }, [])

  return (
    <div id="canvas">
      <div id='landing-main' style={{ position: 'absolute', top: '35%', left: '50%'}}>
        <span style={{ 'font-size': '7.5em'}}> INDEXED </span>
        <p> A FINANCIAL INDEX PROTOCOL. </p>
      </div>
    </div>
  )
}

import React, { useEffect } from 'react'

import { renderCanvas } from '../utils/canvas'

export default function Root(){

  useEffect(() => {
    renderCanvas()
  }, [])

  return (
    <div id="canvas">
      <div style={{ position: 'absolute', top: '50%', left: '50%'}}>
        <span style={{ 'font-size': '7.5em'}}> INDEXED </span>
      </div>
    </div>
  )
}

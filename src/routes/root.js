import React, { useEffect } from 'react'

import { renderCanvas } from '../utils/canvas'

export default function Root(){

  useEffect(() => {
    renderCanvas()
  }, [])

  return <div id="canvas" />
}

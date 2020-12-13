import React from 'react'

import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

const Wrapper = styled(Paper)({
  border: `3px solid #666666`,
  borderRadius: 10,
  overflow: 'auto',
})

export default function Canvas({ native, children, color, button, style, custom }){
  let margin = 'auto'

  if(!style) {
     margin = native ? '2em 1.5em .5em 1.5em' : '3em 3em .5em 3em'
  }

  if(native === undefined) margin = '1.5em 0em'
  if(!color) color = '#666666'
  if(custom) style.width = `calc(${style.width}px - ${custom})`

  return <Wrapper style={{ margin, ...style }}> {children} </Wrapper>
}

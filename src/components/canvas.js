import React, { useEffect } from 'react'

import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

export default function Canvas({ native, children, color, button, style }){

  let margin = native ? '2em 1.5em .5em 1.5em' : '3em 3em .5em 3em'
  let hover = {}

  if(native == undefined) margin = '1.5em 0em'
  if(button) hover = {'&:hover': { transition: '0s', border: '3px solid #00e79a', transform: 'translateY(-1.25px)' }}
  if(!color) color = '#666666'
  if(style) style.width = `calc(${style.width}px - 6.75%)`

  const Wrapper = styled(Paper)({
    border: `3px solid ${color}`,
    borderRadius: 10,
    overflow: 'auto',
    margin,
    ...hover,
    ...style
  })

  return <Wrapper> {children} </Wrapper>
}

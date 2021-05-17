import React from 'react'

import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

const Wrapper = styled(Paper)({
  border: `3px solid #666666`,
  borderRadius: 10,
  overflow: 'auto',
  '&:hover': {
    transition: '0s',
    borderColor: '#00e79a !important',
    transform: 'translateY(-1.25px)'
  }
})

export default function Canvas({
  native = undefined,
  children = undefined,
  color = undefined,
  button = undefined,
  style = undefined,
  custom = undefined,
  className = ''
}){

  let margin = native ? '1em 1.5em .5em 1.5em' : '3em 0em .5em 3em'

  if(native === undefined) margin = '1.5em 0em'
  if(!color) color = '#666666'
  if(custom) style.width = `calc(${style.width}px - ${custom})`

  return <Wrapper style={{ ...style, margin, borderColor: color }} className={className}> {children} </Wrapper>
}

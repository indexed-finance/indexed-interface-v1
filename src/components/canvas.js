import React from 'react'

import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

export default function Canvas({ native, children }){

  let margin = native ? '2em 1.5em .5em 1.5em' : '3em 3em .5em 3em'

  const Wrapper = styled(Paper)({
    border: '3px solid #666666',
    borderRadius: 10,
    height: '100%',
    overflow: 'auto',
    margin
  })

  return <Wrapper> {children} </Wrapper>
}

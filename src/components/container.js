import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { styled } from '@material-ui/core/styles'

const Wrapper = styled(Paper)({
  padding: '1em 2em',
  border: '3px solid #666666',
  borderRadius: 10,
  margin: '2em 3em',
  '& header': {
    marginTop: '-2em',
    background: 'white',
    padding: '0em 1em 0em 1em',
    width: '11.5%',
    fontFamily: 'San Francisco Bold',
    letterSpacing: 3,
  }
})

export default function Container({ title, components }){
  return(
    <Wrapper>
      <header>
        <Typography variant='h5'> {title} </Typography>
      </header>
      {components}
    </Wrapper>
  )
}

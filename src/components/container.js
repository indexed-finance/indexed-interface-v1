import React, { Fragment, useState, useEffect, useContext } from "react";

import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { styled } from '@material-ui/core/styles'


export default function Container({ margin, title, components, percentage }){

  const Wrapper = styled(Paper)({
    padding: '1em 2em',
    border: '3px solid #666666',
    borderRadius: 10,
    margin: `${margin} 3em`,
    '& header': {
      marginTop: '-2em',
      background: 'white',
      padding: '0em 1em 0em 1em',
      width: percentage,
      fontFamily: 'San Francisco Bold',
      letterSpacing: 3,
    }
  })

  return(
    <Wrapper>
      <header>
        <Typography variant='h5'> {title} </Typography>
      </header>
      {components}
    </Wrapper>
  )
}

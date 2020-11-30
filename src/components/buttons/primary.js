import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export default function ButtonPrimary(props){
  const theme = useTheme()
  let { secondary, primary } = theme.palette
  let margin = {}

  if(props.margin){
    margin = { ...props.margin }
  } else {
    margin.marginTop = 10
    margin.marginLeft = 125
  }

  const Restyled = styled(Button)({
    border: '2px solid #999999',
    color: secondary.main,
    borderRadius: 5,
    padding: '.5em 2.25em',
    ...margin,
    float: 'right',
    '&:hover': {
      fontWeight: 'bold'
    }
  })

  return <Restyled {...props} />
}

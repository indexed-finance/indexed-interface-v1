import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export default function ButtonMarket(props){
  const theme = useTheme()
  let { primary, secondary } = theme.palette

  const Restyled = styled(Button)({
    background: primary.main,
    color: secondary.main,
    border: 'solid 2.5px #666666',
    '&:first-of-type, &:nth-of-type(2)': {
      borderRight: 'none',
    },
    '&:hover, &:active': {
      fontWeight: 'bold',
    },
  })

  return <Restyled {...props} />
}

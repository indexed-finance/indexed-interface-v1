import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

export default function ButtonMarket(props){
  const theme = useTheme()
  let { primary, secondary } = theme.palette

  const Restyled = styled(Button)({
    root: {
      background: primary.main,
      color: secondary.main,
      border: 'solid 3px #999999 !important',
      borderWidth: 3,
      '&:first-of-type, &:nth-of-type(2)': {
        borderRight: 'none !important',
      },
      '&:hover, &:active': {
        backgroundColor: 'rgba(112, 245, 112, 0.575) !important',
        color: 'white !important',
      },
    }
  })

  return <Restyled {...props} />
}

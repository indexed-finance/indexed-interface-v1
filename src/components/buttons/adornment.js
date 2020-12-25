import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'

export default function TransactionButton(props){
  const theme = useTheme()
  let { secondary } = theme.palette

  const Restyled = styled(Button)({
    border: 'none',
    color: secondary.main,
    padding: 0,
    margin: 0,
    '&:hover': {
      color: '#00e79a',
      fontWeight: 'bold',
      background: 'inherit',
      '& o': {
        color: `${secondary.main}`,
      }
    }
  })

  return <Restyled {...props} />
}

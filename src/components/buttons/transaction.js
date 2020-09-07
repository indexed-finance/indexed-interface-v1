import React from 'react'

import { styled } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const TransactionButton = styled(Button)({
  border: 'none',
  color: '#333333',
  padding: 0,
  margin: 0,
  '&:hover': {
    color: '#009966',
    fontWeight: 'bold',
    background: 'inherit'
  },
  '& o': {
    color: '#333333 !important'
  }
})

export default TransactionButton

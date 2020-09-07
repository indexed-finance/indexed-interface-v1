import React from 'react'

import { styled } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const Primary = styled(Button)({
  border: '2px solid #999999',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.25em',
  marginTop: 10,
  marginLeft: 125,
  float: 'right',
  '&:hover': {
    fontWeight: 'bold',
    color: '#333333'
  }
})

export default Primary

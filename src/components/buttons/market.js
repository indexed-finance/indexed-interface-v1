import React from 'react'

import { styled, useTheme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Tooltip } from '@material-ui/core'

export default function ButtonMarket(props){
  const theme = useTheme()
  const { title, ...buttonProps } = props;
  let { primary, secondary } = theme.palette

  const Restyled = styled(Button)({
    border: 'solid 2.5px #666666',
    '&:first-of-type, &:nth-of-type(2)': {
      borderRight: 'none',
    },
    '&:hover, &:active': {
      fontWeight: 'bold',
    },
  })

  return (
    title
      ?
      <Tooltip title={title}>
        <Restyled {...buttonProps} />
      </Tooltip>
      : <Restyled {...buttonProps} />
  )
}

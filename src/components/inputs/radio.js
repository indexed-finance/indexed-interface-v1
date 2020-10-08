import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'

export default function Option(props){
  const Restyled = withStyles({
    root: {
      color: props.color,
      '&$checked': {
        color: props.color,
      },
    },
    checked: {},
  })(Radio)

  return <Restyled {...props} color='default' />
}

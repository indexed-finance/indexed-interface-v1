import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'

export default function Progress(props){
  const Restyled = withStyles((theme) => ({
    root: {
      height: 15,
      borderRadius: 10,
      width: props.width,
      float: 'left'
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: props.color,
    },
  }))(({ classes, ...props }) => {
    return (
      <LinearProgress
       variant="determinate"
        classes={{
          ...classes
      }}
      {...props}
      />
    )
  })

  return <Restyled  />
}

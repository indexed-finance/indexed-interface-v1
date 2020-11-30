import React from 'react'

import Paper from '@material-ui/core/Paper'
import { styled } from '@material-ui/core/styles'

const Restyle = styled(Paper)({
  borderLeft: '5px solid #666666',
  borderRight: '3px solid #666666',
  borderTop: '3px solid #666666',
  borderBottom: '3px solid #666666',
  borderTopLeftRadius: 200,
  borderBottomLeftRadius: 200,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
  width: '45%',
  boxShadow: 'none',
  position: 'relative',
  float: 'right',
})


export default function Wrapper(props){
  return <Restyle {...props} />
}

import React, { useContext } from 'react'

import { Loader } from 'react-loaders'
import Grid from '@material-ui/core/Grid'
import { store } from '../state'

import 'loaders.css'

export default function LoadingAnimation(){
  let { state } = useContext(store)

  let padding = !state.native ? '42.5vh' : '30vh'

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item>
        <div style={{ padding }}>
          <Loader size="Large" color="#666666" type="line-scale-pulse-out-rapid" active />
        </div>
      </Grid>
    </Grid>
  )
}

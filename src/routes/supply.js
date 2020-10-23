import React, { useState, useContext } from 'react'

import Grid from '@material-ui/core/Grid'
import { usePalette } from 'react-palette'
import { useParams } from  'react-router-dom'

import style from '../assets/css/routes/supply'
import Canvas from '../components/canvas'
import Container from '../components/container'
import ButtonPrimary from '../components/buttons/primary'
import Input from '../components/inputs/input'
import Adornment from '../components/inputs/adornment'
import NumberFormat from '../utils/format'

import { tokenMetadata } from '../assets/constants/parameters'
import getStyles from '../assets/css'
import { store } from '../state'

const useStyles = getStyles(style)

export default function Supply() {
  let { state, dispatch } = useContext(store)
  let { asset } = useParams()
  let classes = useStyles()

  return(
    <Grid container direction='column' alignItems='center' justify='center'>
      <Grid item md={6}>
        <Container margin='5em 0em 0em 0em' padding="1em 2em" percentage='50%' title={asset.toUpperCase()}>
          <div className={classes.modal}>
            <Grid container direction='column' alignItems='center' justify='center'>
              <Grid item>
              <Input label="AMOUNT" variant='outlined'
                helperText={<o> BALANCE: 0 </o>}
                name="input"
                InputProps={{
                  inputComponent: NumberFormat
                }}
              />
            </Grid>
            </Grid>
          </div>
        </Container>
      </Grid>
      <Grid item md={6}>
        <Canvas>
          TEST
        </Canvas>
      </Grid>
    </Grid>
  )
}

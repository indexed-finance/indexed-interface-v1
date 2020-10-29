import React, { useState, useContext, useEffect, forwardRef } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

import { store } from '../state'
import style from '../assets/css/components/flag'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function TransitionAlerts() {
  const [open, setOpen] = useState(false)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleClose = () => {
    dispatch({ type: 'CLOSE' })
  }

  let { message, show, opcode } = state.flag

  let { left, bottom } = style.getFormatting(state.native)

  useEffect(() => {
   const dismiss = setTimeout(() => { handleClose() }, 10000)

   setOpen(show)

   return () => clearTimeout(dismiss)
  }, [ show ])

  return (
    <div className={classes.root} style={{ left, bottom }}>
      <Slide direction="up" in={open}>
        <Alert variant='outlined' severity={opcode}
          action={
            <IconButton size="small"onClick={handleClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
            }
          >
          {message}
        </Alert>
      </Slide>
    </div>
  );
}

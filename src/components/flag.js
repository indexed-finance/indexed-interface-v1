import React, { useState, useContext, useEffect } from 'react';

import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';

import EtherScanLink from './buttons/etherscan-link';

import { store } from '../state'
import style from '../assets/css/components/flag'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

export default function TransitionAlerts() {
  const [open, setOpen] = useState(false)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  const handleClose = () => dispatch({ type: 'CLOSE' });

  let { message, show, opcode, etherscan } = state.flag;
  let { left, bottom, right } = style.getFormatting(state.native)

  useEffect(() => {
   const dismiss = setTimeout(() => { handleClose() }, 10000)
   setOpen(show)
   return () => clearTimeout(dismiss)
  }, [ show ])

  let etherscanLink = etherscan ? EtherScanLink(etherscan) : null;

  return (
    <div className={classes.root} style={{ left, bottom, right }}>
      <Slide direction="up" in={open}>
        <Alert variant='outlined' severity={opcode}
          action={
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
            }
          >
          {message}
          {etherscanLink ? etherscanLink : ''}
        </Alert>
      </Slide>
    </div>
  );
}

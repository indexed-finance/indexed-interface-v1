import React, { useState, useContext, useEffect } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import ButtonPrimary from './buttons/primary'
import { store } from '../state'
import style from '../assets/css/components/modal'
import getStyles from '../assets/css'

const useStyles = getStyles(style)

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Modal() {
  const [open, setOpen] = useState(false);
  const classes = useStyles()
  let { state, dispatch } = useContext(store)

  const handleClose = () => {
    dispatch({ type: 'DISMISS' })
  }

  function DialogTitle(props) {
    let { children, onClose, ...other } = props;

    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  }

  useEffect(() => {
    setOpen(state.modal.show)
  }, [ state.modal.show ])

  let { message, title, actions } = state.modal

  return (
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle onClose={handleClose}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions.map(act => {
            if(act.f == null) act.f = handleClose

            return(
              <ButtonPrimary variant='outlined' onClick={act.f} color="primary">
                {act.label}
              </ButtonPrimary>
            )
          })}
        </DialogActions>
      </Dialog>
  );
}

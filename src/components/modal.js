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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

export default function Modal() {
  const [open, setOpen] = useState(false);

  let { state, dispatch } = useContext(store)

  const handleClose = () => {
    dispatch({ type: 'DISMISS' })
  }

  const DialogTitle = withStyles(styles)((props) => {
    let { children, classes, onClose, ...other } = props;

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
  })

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
          {actions.map(act => (
            <ButtonPrimary variant='outlined' onClick={act.f} color="primary">
              {act.label}
            </ButtonPrimary>
          ))}
        </DialogActions>
      </Dialog>
  );
}

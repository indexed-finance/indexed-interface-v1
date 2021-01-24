import React, { Fragment, useContext } from 'react';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { IconButton } from '@material-ui/core';

// import Modal from '../modal';
import { store } from '../../state'
import Modal from '../modal';


const message = 'creditMsg';

export default function ExplainCredit(props) {
  const { dispatch } = useContext(store);
  const handleOpen = () => {
    const payload = {
      title: 'creditTitle',
      message,
      actions: [],
      show: true
    };
    dispatch({ type: 'MODAL', payload });
  }
  const size = props.size || 'small';
  return <Fragment>
    <IconButton size={size} onClick={handleOpen} style={{ margin: 0, padding: 0 }}>
      <HelpOutlineIcon fontSize='inherit' />
    </IconButton>
    {/* <Modal /> */}
  </Fragment>
}

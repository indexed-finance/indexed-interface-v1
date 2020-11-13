import React, { Fragment, useContext } from 'react';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { IconButton } from '@material-ui/core';

// import Modal from '../modal';
import { store } from '../../state'
import Modal from '../modal';


const message = `Index pools are not deployed with their full initial balances because the NDX DAO does not hold any tokens.

We use a crowd-funding contract which allows users to contribute tokens to the pool before it is initialized.

Users are credited for the value of the tokens they contribute using an on-chain Uniswap oracle that tracks token prices in Ether.

Once all the target balances are reached, the pool can be initialized and users can claim their share of the first 100 tokens.`;

export default function ExplainCredit(props) {
  const { dispatch } = useContext(store);
  const handleOpen = () => {
    const payload = {
      title: 'What are credits?',
      message,
      actions: [],
      show: true
    };
    dispatch({ type: 'MODAL', payload });
  }
  const size = props.size || 'small';
  return <Fragment>
    <IconButton size={size} onClick={handleOpen}>
      <HelpOutlineIcon fontSize='inherit' />
    </IconButton>
    {/* <Modal /> */}
  </Fragment>
}
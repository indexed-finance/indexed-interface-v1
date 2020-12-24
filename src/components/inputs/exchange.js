import React from 'react';

import { styled } from '@material-ui/core/styles'

import Adornment from './adornment'
import Input from './input'

export default function ExchangeInput(props) {
  let token = props.useToken();
  let errorMsg = token.errorMessage;
  let error = !!errorMsg;

  let helperText = (error) ? errorMsg : <span style={{ float: 'left', cursor: 'pointer'}} onClick={() => token.setAmountToBalance()}>
    {`BALANCE: ${parseFloat(token.displayBalance).toFixed(2)}`}
  </span>;

  let endAdornment = <Adornment onSelect={props.onSelect} market={token.symbol} assets={props.tokens} />

  return(
    <Input
      variant='outlined'
      label={props.label}
      error={error}
      type='number'
      style={{
        marginBottom: 7.5,
        width: props.inputWidth
      }}
      InputProps={{ endAdornment }}
      helperText={helperText}
      {...(token.bindInput)}
    />
  );
}

import React from 'react';

import { styled } from '@material-ui/core/styles'

import Adornment from './adornment'
import Input from './input'

const TradeInput = styled(Input)({
  '& input': {
    height: 37.5,
    fontSize: 20
  }
})

export default function ExchangeInput(props) {
  let token = props.useToken();
  let errorMsg = token.errorMessage;
  let error = !!errorMsg;

  let helperText = (error) ? errorMsg : <span style={{ float: 'left', cursor: 'pointer'}} onClick={() => token.setAmountToBalance()}>
    {`BALANCE: ${token.displayBalance}`}
  </span>;

  let endAdornment = <Adornment onSelect={props.onSelect} market={token.symbol} assets={props.tokens} />

  return(
    <TradeInput
      variant='outlined'
      label={props.label}
      type='number'
      style={{ marginBottom: 10 }}
      InputLabelProps={{ shrink: true }}
      InputProps={{ endAdornment }}
      helperText={helperText}
      {...(token.bindInput)}
    />
  );
}

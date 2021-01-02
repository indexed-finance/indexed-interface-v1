import React from 'react';


import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'

import { InputAdornment } from '@material-ui/core';
import WhitelistSelect from '../inputs/whitelist-select';
import Input from '../inputs/input';

const useStyles = getStyles(style)

export default function TradeInput(props) {
  const classes = useStyles();
  let token = props.useToken();
  let errorMsg = token.errorMessage;
  let error = !!errorMsg;

  let helperText = (error) ? errorMsg : <span style={{ float: 'left', cursor: 'pointer'}} onClick={() => token.setAmountToBalance()}>
    {`BALANCE: ${token.displayBalance}`}
  </span>;

  let endAdornment = <InputAdornment style={{ paddingRight: 5 }} position="end">{token.symbol}</InputAdornment>;

  let label = token.isPoolToken ? 'inputs' : 'altInputs'

  return(
    <Input
      className={classes[label]}
      error={error}
      variant='outlined'
      label={props.label || 'AMOUNT'}
      type='number'
      helperText={helperText}
      style={{ marginBottom: 7.5, width: props.inputWidth }}
      InputLabelProps={{ shrink: true }}
      {...(token.bindInput)}
      InputProps={{ endAdornment }}
    />
    );
}

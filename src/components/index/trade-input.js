import React from 'react';


import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'

import { InputAdornment } from '@material-ui/core';
import WhitelistSelect from '../inputs/whitelist-select';
import Input from '../inputs/input';
import { useTranslation, Trans } from 'react-i18next';

const useStyles = getStyles(style)

export default function TradeInput(props) {
  const classes = useStyles();
  let token = props.useToken();
  let errorMsg = token.errorMessage;
  let error = !!errorMsg;
  const { t } = useTranslation();

  let helperText = (error) ? t(errorMsg) : <span style={{ float: 'left', cursor: 'pointer'}} onClick={() => token.setAmountToBalance()}>
    {t('balanceMsg', {balance: token.displayBalance})}
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

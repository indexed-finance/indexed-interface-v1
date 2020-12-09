import React, { useContext } from 'react';
import { styled } from '@material-ui/core/styles'

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import ButtonTransaction from '../buttons/transaction'
import Input from '../inputs/input';

import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'

import { getERC20 } from '../../lib/erc20';
import WhitelistSelect from '../inputs/whitelist-select';
import { InputAdornment } from '@material-ui/core';

const useStyles = getStyles(style)

export default function TradeInput(props) {
  const classes = useStyles();
  let token = props.useToken();
  let { state: { account, web3 }, handleTransaction } = useContext(store);

  // Set `amount` to `balance`

  async function approveRemaining() {
    const erc20 = getERC20(web3.injected, token.address);
    let fn = erc20.methods.approve(token.target, toHex(token.approvalRemainder))
    await handleTransaction(fn.send({ from: account }))
      .then(token.updateDidApprove)
      .catch((() => {}));
  }

  let errorMsg = token.errorMessage;
  let error = !!errorMsg;

  let helperText = (error) ? errorMsg : <span className={classes.helper} onClick={() => token.setAmountToBalance()}>
    {`BALANCE: ${token.displayBalance}`}
  </span>;

  let endAdornment;
  if (!token.isPoolToken) {
    endAdornment = <WhitelistSelect whitelistSymbols={props.whitelistSymbols} selectedSymbol={token.symbol} onSelect={props.selectWhitelistToken} />
  } else {
    endAdornment = <InputAdornment style={{ paddingRight: 5 }} position="end">{token.symbol}</InputAdornment>
  }

  let label = token.isPoolToken ? 'inputs' : 'altInputs'

  return(
    <Input
      className={classes[label]}
      error={error}
      variant='outlined'
      label='AMOUNT'
      type='number'
      helperText={helperText}
      style={{ width: props.inputWidth }}
      InputLabelProps={{ shrink: true }}
      {...(token.bindInput)}
      InputProps={{ endAdornment }}
    />
    );
}

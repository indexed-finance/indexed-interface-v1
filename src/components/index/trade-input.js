import React, { useContext } from 'react';
import { styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import ButtonTransaction from '../buttons/transaction'
import Input from '../inputs/input';

import style from '../../assets/css/components/trade'
import getStyles from '../../assets/css'
import { store } from '../../state'

import { tokenMetadata } from '../../assets/constants/parameters';
import { getERC20 } from '../../lib/erc20';
import WhitelistSelect from '../inputs/whitelist-select';
import NDX from '../../assets/images/indexed-light.png'
import { InputAdornment } from '@material-ui/core';

const ApproveButton = styled(ButtonTransaction)({
  fontSize: 10,
  paddingRight: 5
})

const Tick = styled(ListItemIcon)({
  minWidth: 35,
})

const AmountInput = styled(Input)({
  width: 175,
  '& label': {
    fontSize: 12
  },
  '& fieldset': {
    borderWidth: 1,
  },
  '& input': {
    padding: '.75em 0 .75em .75em',
  }
})

const SecondaryActionAlt = styled(ListItemSecondaryAction)({
  top: '57.5%',
  maringLeft: 25,
  cursor: 'pointer'
})

const useStyles = getStyles(style)

const tokenImage = (symbol) => tokenMetadata[symbol] ? tokenMetadata[symbol].image : NDX;

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
  let startAdornment;
  if (token.isInput) {
    startAdornment = <ApproveButton onClick={approveRemaining} disabled={!(token.approvalNeeded) || error}>
        APPROVE
    </ApproveButton>
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
      InputProps={{
        // startAdornment,
        endAdornment
      }}
    />
    );
    // <ListItem
    //   className={classes[label]}
    //   button
    //   onClick={token.toggleSelect}
    //   key={token.address}
    // >
    //   <ListItemAvatar className={classes.wrapper}>
    //     <Avatar className={classes.avatar} src={tokenImage(token.symbol)} />
    //   </ListItemAvatar>
    //   <ListItemText style={{ width: '30px' }} primary={token.symbol} secondary={props.secondary || token.symbolAdornment} />
      
    //   <SecondaryActionAlt>
    //     <Input
    //       className={classes.inputs}
    //       error={error}
    //       variant='outlined'
    //       label='AMOUNT'
    //       type='number'
    //       helperText={helperText}
    //       style={{ width: props.inputWidth }}
    //       InputLabelProps={{ shrink: true }}
    //       {...(token.bindInput)}
    //       InputProps={{
    //         // startAdornment,
    //         endAdornment
    //      }}
    //     />
    //   </SecondaryActionAlt>
    // </ListItem>
}

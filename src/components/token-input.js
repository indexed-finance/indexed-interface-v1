import React, { useContext } from 'react';
import { styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import ButtonTransaction from './buttons/transaction'
import Input from './inputs/input';

import style from '../assets/css/components/approvals'
import getStyles from '../assets/css'
import { store } from '../state'

import { tokenMetadata } from '../assets/constants/parameters';
import { getERC20 } from '../lib/erc20';

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
  '& input:valid + fieldset': {
    borderColor: '#999999',
    borderWidth: '1px !important',
  },
  '& input:invalid + fieldset': {
    borderColor: 'red',
    borderWidth: '1px !important',
  },
  '& input:valid:focus + fieldset': {
    borderWidth: '1px !important',
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

export default function TokenInput(props) {
  const classes = useStyles();
  let token = props.useToken(props.index);
  let { state: { account, web3 }, handleTransaction } = useContext(store);

  // Set `amount` to `balance`
  const setAmountToBalance = () => token.setAmountToBalance();

  async function approveRemaining() {
    const erc20 = getERC20(web3.injected, token.address);
    let fn = erc20.methods.approve(token.target, toHex(token.approvalRemainder))
    await handleTransaction(fn.send({ from: account }))
      .then(token.updateDidApprove)
      .catch((() => {}));
  }

  return(
    <ListItem
      className={classes[props.label]}
      button
      onClick={token.toggleSelect}
      key={token.address}
    >
        <Tick>
          <Checkbox
            edge="start"
            {...(token.bindSelectButton)}
            tabIndex={-1}
            disableRipple
          />
        </Tick>
      <ListItemAvatar className={classes.wrapper}>
        <Avatar className={classes.avatar} src={tokenMetadata[token.symbol].image} />
      </ListItemAvatar>
      <ListItemText primary={token.symbol} secondary={props.secondary} />
      <SecondaryActionAlt>
        <AmountInput
          variant='outlined'
          label='AMOUNT'
          type='number'
          helperText={
            <o className={classes.helper} onClick={() => setAmountToBalance()}>
              BALANCE: {token.displayBalance}
           </o>}
          style={{ width: props.inputWidth }}
          InputLabelProps={{ shrink: true }}
          {...(token.bindApproveInput)}
          InputProps={{
            endAdornment:
            <ApproveButton onClick={approveRemaining} disabled={!(token.approvalNeeded)}>
              APPROVE
           </ApproveButton>
         }}
        />
      </SecondaryActionAlt>
    </ListItem>
    )
}

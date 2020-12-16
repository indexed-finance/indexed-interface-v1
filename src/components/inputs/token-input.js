import React, { useContext, useState, useEffect } from 'react';

import { styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

import { toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import ButtonTransaction from '../buttons/transaction'
import Input from './input';

import style from '../../assets/css/components/approvals'
import getStyles from '../../assets/css'
import { store } from '../../state'

import { tokenMetadata } from '../../assets/constants/parameters';
import { getERC20 } from '../../lib/erc20';

const ApproveButton = styled(ButtonTransaction)({
  fontSize: 10,
  paddingRight: 5,
  '&:hover': {
    color: '#00e79a !important'
  }
})

const Tick = styled(ListItemIcon)({
  minWidth: 35,
})

const RemainderButton = styled(ButtonTransaction)({
  color: '#999999 !important',
  fontSize: 8,
  position: 'absolute',
  zIndex: 2,
  bottom: '1em',
  '&:hover': {
    color: 'orange !important'
  }
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

export default function TokenInput(props) {
  const classes = useStyles();
  let token = props.useToken(props.index);
  let { state: { account, native, web3 }, handleTransaction } = useContext(store);

  // Set `amount` to `balance`
  const setAmountToBalance = () => token.setAmountToBalance();
  const [ label, setLabel ] = useState('DESIRED:')

  async function approveTarget() {
    const erc20 = getERC20(web3.injected, token.address);
    let fn = erc20.methods.approve(token.target, toHex(token.maximumAmountIn || token.amount))
    await handleTransaction(fn.send({ from: account }))
      .then(token.updateDidApprove)
      .catch((() => {}));
  }

  let errorMsg = token.errorMessage;
  let error = !!errorMsg;

  let helperText = (error) ? errorMsg : <span className={classes.helper} onClick={() => setAmountToBalance()}>
    {`BALANCE: ${parseFloat(token.displayBalance).toLocaleString()}`}
  </span>;

  useEffect(() => {
    if(token.bindSetRemainderButton){
      setLabel(token.bindSetRemainderButton.value)
    }
  }, [ token.bindSetRemainderButton ])

  let { show, inputWidth } = style.getFormatting(native)

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
       {show && (
        <ListItemAvatar className={classes.wrapper}>
          <Avatar alt={classes.avatar} className={classes.avatar} src={tokenMetadata[token.symbol].image} />
        </ListItemAvatar>
      )}
      <ListItemText style={{ width: '30px' }} primary={token.symbol} secondary={props.secondary || token.symbolAdornment} />
      {
        token.bindSetRemainderButton && !native &&
        <RemainderButton {...token.bindSetRemainderButton}>
         {label}
        </RemainderButton>
      }
      <SecondaryActionAlt>
        <AmountInput
          error={error}
          variant='outlined'
          label='AMOUNT'
          type='number'
          helperText={helperText}
          style={{ width: props.isInitialiser ? inputWidth : props.inputWidth }}
          InputLabelProps={{ shrink: true }}
          {...(token.bindApproveInput)}
          InputProps={{
            endAdornment:
            <ApproveButton onClick={approveTarget} disabled={!(token.approvalNeeded) || error}>
              APPROVE
           </ApproveButton>
         }}
        />
      </SecondaryActionAlt>
    </ListItem>
    )
}

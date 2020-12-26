import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
  customWidth: {
    maxWidth: 175,
  },
}));

export function MinimumAmountToolTip() {
  return <HelperTooltip text='To protect against large price swings, the transaction will revert if the minimum output is not received.' />
}

export function MaximumAmountToolTip() {
  return <HelperTooltip text='To protect against large price swings, the transaction will revert if the maximum input is exceeded.' />
}

export function SlippgeExceedsTrueValue({ isWethPair }) {
  let message = isWethPair ? ['is greater than', 'Mint'] : ['is less than', 'Burn']

  return <HelperTooltip text={`WARNING, this orders spot price ${message[0]} the index's true USD value! ${message[1]} some tokens for a better quote.`} />
}

export function MaximumSupplyTooltip() {
  return <HelperTooltip text='The maximum supply is currently restricted to minimize risk to users.' />
}

export default function HelperTooltip({ text }) {
  const classes = useStyles();

  return <Tooltip title={text} classes={{ tooltip: classes.customWidth }}>
    <HelpIcon fontSize='inherit' style={{ marginRight: 0 }} />
  </Tooltip>
}

import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import { Tooltip } from '@material-ui/core';

export function MinimumAmountToolTip() {
  return <HelperTooltip text='To protect against large price swings, the transaction will revert if the minimum output is not received.' />
}

export function MaximumAmountToolTip() {
  return <HelperTooltip text='To protect against large price swings, the transaction will revert if the maximum input is exceeded.' />
}

export default function HelperTooltip({ text }) {
  return <Tooltip title={text}>
    <HelpIcon fontSize='inherit' style={{  marginRight: 0 }} />
  </Tooltip>
}

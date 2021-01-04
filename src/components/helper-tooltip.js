import React, { useState } from 'react';
import HelpIcon from '@material-ui/icons/Help';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
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

  return <HelperTooltip text={`WARNING, this order's spot price ${message[0]} the value of the token! ${message[1]} some tokens for a better price.`} />
}

export function MaximumSupplyTooltip() {
  return <HelperTooltip text='The maximum supply is currently restricted to minimize risk to users.' />
}

export default function HelperTooltip({ text }) {
  const [ isOpen, setOpen ] = useState(false)
  const classes = useStyles();

  const closeTooltip = () => setOpen(false)
  const openTooltip = () => setOpen(true)
  const toggleTooltip = () => setOpen(!isOpen)

  return (
      <Tooltip onClose={closeTooltip} open={isOpen} title={text} classes={{ tooltip: classes.customWidth }}>
        <HelpIcon
          onMouseEnter={openTooltip} onMouseLeave={closeTooltip} onClick={toggleTooltip}
          fontSize='inherit' style={{ marginRight: 0 }}
        />
      </Tooltip>
  )
}

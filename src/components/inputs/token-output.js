import React from 'react';
import { styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

import Input from './input';

import style from '../../assets/css/components/approvals'
import getStyles from '../../assets/css'

import { tokenMetadata } from '../../assets/constants/parameters';

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

export default function TokenOutput(props) {
  const classes = useStyles();
  let token = props.useToken(props.index);

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
          style={{ width: props.inputWidth }}
          InputLabelProps={{ shrink: true }}
          {...(token.bindInput)}
        />
      </SecondaryActionAlt>
    </ListItem>
    )
}

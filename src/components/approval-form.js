import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import Grid from '@material-ui/core/Grid'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import { formatBalance, toTokenAmount, toWei, BigNumber } from '@indexed-finance/indexed.js/dist/utils/bignumber';

import { TX_CONFIRM, TX_REJECT, TX_REVERT, WEB3_PROVIDER } from '../assets/constants/parameters'
import { balanceOf, getERC20, allowance } from '../lib/erc20'
import { getRateSingle, getRateMulti, decToWeiHex } from '../lib/markets'
import { tokenMetadata, initialState } from '../assets/constants/parameters'
import style from '../assets/css/components/approvals'
import getStyles from '../assets/css'
import { store } from '../state'

import BPool from '../assets/constants/abi/BPool.json'
import NumberFormat from '../utils/format'
import ButtonPrimary from './buttons/primary'
import ButtonTransaction from './buttons/transaction'
import Adornment from './inputs/adornment'
import Input from './inputs/input'

import TokenInput from './token-input';
import { useTokenAmounts } from './hooks/useTokenAmount'

/*

helper in parent class:
on
*/

const useStyles = getStyles(style)

// balance, metadata, height, width, input, param, set, change, rates
export default function Approvals({ tokens, useToken, height, width }) {

  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  let inputWidth = !state.native ? 200 : 150

  return (
    <List className={classes.list} style={{ height, width }} /* dense={dense} */>
      {
        tokens.map((token, index) => {
          let label = index === tokens.length-1 ? 'last' : 'item'
          let secondary =  state.native ? <span id={token.symbol} /> : null
          return <TokenInput index={index} label={label} secondary={secondary} token={token} useToken={useToken} inputWidth={inputWidth}  />
        })
      }
    </List>
  )
}
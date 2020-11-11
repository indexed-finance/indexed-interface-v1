import React, { useContext } from 'react'


import List from '@material-ui/core/List'

import style from '../assets/css/components/approvals'
import getStyles from '../assets/css'
import { store } from '../state'

import TokenInput from './token-input';

const useStyles = getStyles(style)

// balance, metadata, height, width, input, param, set, change, rates
export default function Approvals({ tokens, useToken, height, width }) {
  const classes = useStyles()

  let { state } = useContext(store)

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

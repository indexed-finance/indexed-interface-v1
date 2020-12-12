import React, { useContext } from 'react'


import List from '@material-ui/core/List'

import style from '../../assets/css/components/approvals'
import getStyles from '../../assets/css'
import { store } from '../../state'

import TokenInput from './token-input';

const useStyles = getStyles(style)

export default function TokenInputs({ isInitialiser, tokens, useToken, height, width }) {
  const classes = useStyles()

  let { state } = useContext(store)

  let inputWidth = !state.native ? 200 : 175

  return (
    <List className={classes.list} style={{ height, width }} dense={state.native}>
      {
        tokens.map((token, index) => {
          let label = index === tokens.length-1 ? 'last' : 'item'
          let secondary =  state.native ? <span id={token.symbol} /> : null
          return token.amountRemaining.eq(0) ? <></> : <TokenInput isInitialiser={isInitialiser} key={index} index={index} label={label} secondary={secondary} token={token} useToken={useToken} inputWidth={inputWidth}  />
        })
      }
    </List>
  )
}

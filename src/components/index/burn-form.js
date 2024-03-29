import React, { useContext } from 'react'


import List from '@material-ui/core/List'

import style from '../../assets/css/components/approvals'
import getStyles from '../../assets/css'
import { store } from '../../state'

import TokenOutput from '../inputs/token-output'

const useStyles = getStyles(style)

// balance, metadata, height, width, input, param, set, change, rates
export default function BurnForm({ tokens, useToken, height, width }) {

  const classes = useStyles()

  let { state } = useContext(store)

  return (
    <List className={classes.list} style={{ height, width }} /* dense={dense} */>
      {
        tokens.map((token, index) => {
          let label = index === tokens.length-1 ? 'last' : 'item'
          let secondary =  state.native ? <span id={token.symbol} /> : null
          return <TokenOutput index={index} label={label} secondary={secondary} token={token} useToken={useToken}  />
        })
      }
    </List>
  )
}

import React, { useState, useEffect } from  'react'

import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import { tokenMetadata } from '../../assets/constants/parameters'

const Adornment = styled(InputAdornment)({
  overflow: 'none',
  float: 'right',
})

const Selection = styled(Select)({
  padding: 5,
  '& .MuiInput-underline:before': {
    border: 'none !important',
    boxShadow: 'none !important',
  }
})

export default function CurrencySelect({ market, onSelect, assets }) {
  const [ selections, setSelections ] = useState(assets)
  const [ currency, setCurrency ] = useState(market)

  const handleChange = (event) => {
    let { value } = event.target
    let target = selections.find(i => i.symbol == value)
    const index = selections.indexOf(target);

    setCurrency(value)
    onSelect(index)
  }

  useEffect(() => {
    if(assets){
      setSelections(assets)
    }
  }, [assets])

  useEffect(() => {
    if(currency !== market){
      setCurrency(market)
    }
  }, [ market ])

  return(
    <Adornment style={{ paddingRight: 5 }} position="end">
      <Selection value={currency} onChange={handleChange} >
        {selections.map((cur, i) => (
          <MenuItem key={i} value={cur.symbol}>
            <div style={{ width: 100, display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
              <img src={tokenMetadata[cur.symbol].image} style={{ width: 27.5, padding: 5 }} />
              <span style={{ fontSize: 20, marginBlock: 0, marginTop: 5, marginLeft: 7.5, clear: 'both' }}> {cur.symbol} </span>
            </div>
          </MenuItem>
        ))}
      </Selection>
    </Adornment>
  )
}

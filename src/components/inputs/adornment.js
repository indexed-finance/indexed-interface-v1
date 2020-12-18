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

const defaultSelections = [
  { address:'0xc778417e063141139fce010982780140aa0cd5ab', symbol: 'YFI' },
  { address: '0x2d952ad99184ed4638b9aa288f43de14de3147bf', symbol: 'WBTC' }
]

export default function CurrencySelect({ market, onSelect, assets }) {
  const [ selections, setSelections ] = useState(defaultSelections)
  const [ currency, setCurrency ] = useState(market)

  const handleChange = (event) => {
    let { value } = event.target
    let { address } = selections.find(i => i.symbol == value)

    setCurrency(value)
    // onSelect(address)
  }

  useEffect(() => {
    if(assets){
      setSelections(assets)
    }
  }, [assets])

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

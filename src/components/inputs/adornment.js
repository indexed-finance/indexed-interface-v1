import React, { useState, useEffect } from  'react'

import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

const Selection = styled(Select)({
  padding: 5,
  '& .MuiInput-underline:before': {
    border: 'none !important',
    boxShadow: 'none !important',
  }
})

const selections = [
  { address:'0xc778417e063141139fce010982780140aa0cd5ab', symbol: 'ETH' },
  { address: '0x2d952ad99184ed4638b9aa288f43de14de3147bf', symbol: 'WBTC' }
]

export default function CurrencySelect({ market, onSelect }) {
  const [currency, setCurrency] = useState('ETH')

  const handleChange = (event) => {
    let { value } = event.target
    let { address } = selections.find(i => i.symbol == value)

    setCurrency(value)
    onSelect(address)
  }

  return(
    <InputAdornment style={{ paddingRight: 5 }} position="end">
      <Selection value={currency} onChange={handleChange} >
        {selections.map(i => (
          <MenuItem value={i.symbol}>{i.symbol}</MenuItem>
        ))}
      </Selection>
    </InputAdornment>
  )
}

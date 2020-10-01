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

export default function CurrencySelect({ market, onSelect }) {
  const [currency, setCurrency] = useState(null)

  const handleChange = (event) => {
    setCurrency(event.target.value)
    onSelect(event.target.value)
  }

  useEffect(() => {
    setCurrency(market)
  }, [ market ])

  return(
    <InputAdornment style={{ paddingRight: 5 }} position="end">
      <Selection value={currency} onChange={handleChange} >
        <MenuItem value='ETH'>ETH</MenuItem>
        <MenuItem value={market}>{market}</MenuItem>
      </Selection>
    </InputAdornment>
  )
}

import React, { useState, useEffect } from  'react'

import { styled } from '@material-ui/core/styles'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';

const Selection = styled(Select)({
  padding: 5,
  '& .MuiInput-underline:before': {
    border: 'none !important',
    boxShadow: 'none !important',
  }
})

export default function WhitelistSelect({ selectedSymbol, whitelistSymbols, onSelect }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const index = whitelistSymbols.indexOf(selectedSymbol);
    setSelected(index);
  }, [ selectedSymbol, whitelistSymbols ]);

  const handleChange = (event) => {
    const index = event.target.value;
    setSelected(index);
    onSelect(index);
  }

  return <InputAdornment style={{ paddingRight: 5 }} position="end">
    <Selection value={selected} onChange={handleChange} >
      {whitelistSymbols.map((symbol, i) => (
        <MenuItem key={i} value={i}>{symbol}</MenuItem>
      ))}
    </Selection>
  </InputAdornment>

}

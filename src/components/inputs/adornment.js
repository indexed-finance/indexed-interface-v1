import React, { useState, useEffect } from  'react'

import { styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import { tokenMetadata, getTokenImage } from '../../assets/constants/parameters'

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

  let getImg = (cur) => {
    let meta = tokenMetadata[cur.symbol];
    if (!meta) {
      return getTokenImage(cur);
    } else {
      return meta.image;
    }
  }

  return(
    <Adornment style={{ paddingRight: 0 }} position="end">
      <Selection value={currency} onChange={handleChange} >
        {selections.map((cur, i) => (
          <MenuItem key={i} value={cur.symbol}>
            <div style={{ width: 87.5, display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
              <img src={getImg(cur)} style={{ width: 25, padding: 5 }} />
              <span style={{ fontSize: 16, marginBlock: 0, marginTop: 0, marginLeft: 5, clear: 'both' }}> {cur.symbol} </span>
            </div>
          </MenuItem>
        ))}
      </Selection>
    </Adornment>
  )
}

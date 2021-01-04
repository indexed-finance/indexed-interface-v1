import React from 'react'

export default function Delta({ value }){
  return(
    <span style={{ color: value > 0 ? '#00e79a': '#ff005a'}}>
      &nbsp;({value > 0 ? '+' : ''}{value}%)
    </span>
  )
}

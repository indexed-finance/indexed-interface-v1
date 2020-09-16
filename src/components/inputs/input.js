import React from "react"

import TextField from '@material-ui/core/TextField'
import { styled } from '@material-ui/core/styles'

const Input = styled(TextField)({
  borderRadius: 10,
  margin: '20px 0px',
  '& input': {
    padding: '.75em 1em',
  },
  '& label': {
    top: -5,
  },
  '& label:placeholder-shown': {
    color: '#666666',
    top: -5,
  },
  '& input:placeholder-shown + label': {
    color: '#666666',
    top: -5,
  },
  '& label + fieldset': {
    color: '#666666',
    top: -5,
  },
  '&:hover fieldset': {
   borderColor: '#999999',
 },
 '& label.Mui-focused': {
   color: '#666666',
   top: 2.5,
 },
 '& input:valid + fieldset': {
   borderColor: '#666666',
   borderWidth: 2,
 },
 '& input:invalid + fieldset': {
   borderColor: 'red',
   borderWidth: 2,
 },
 '& input:valid:focus + fieldset': {
   borderWidth: 2,
   borderColor: '#999999',
   paddingRight: '5px !important',
   paddingLeft: '8px !important',
 },
 '& input:active + fieldset': {
   color: '#999999'
 },
 '& .MuiOutlinedInput-notchedOutline': {
   border: '2px solid #666666'
 }
})

export default Input

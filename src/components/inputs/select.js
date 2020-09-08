import React, { useState } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

const InputSelect = styled(Select)({
  borderRadius: 5,
  borderWidth: 2,
  backgroundColor: 'white',
  '& fieldset': {
    border: 'solid 2px #999999',
  },
  '& .MuiOutlinedInput-input': {
    padding: '.75em 1em !important',
  },
  '&input:hover': {
    backgroundColor: 'white'
  },
  '&input:active': {
    backgroundColor: 'white'
  }
})

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: 10,
    marginBottom: 10,
    width: '87.5%'
  },
  label: {
    top: -5
  }
}));

export default function Option({ label, selections }){
  const [ value, setValue ] = useState('')
  const classes = useStyles()

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  return(
    <FormControl variant="outlined" className={classes.formControl}>
       <InputLabel className={classes.label}>{label}</InputLabel>
       <InputSelect
         value={value}
         onChange={setValue}
         label={label}
       >
       <MenuItem value="">
       <em>None</em>
       </MenuItem>
       {selections.map((option) => (
        <MenuItem value={option.value}>
          {option.label}
        </MenuItem>
       ))}
      </InputSelect>
    </FormControl>
  )
}

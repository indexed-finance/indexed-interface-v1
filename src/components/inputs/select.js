import React, { useState } from 'react'

import { makeStyles, styled, useTheme } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    '& fieldset': {
      border: 'solid 2px #999999',
      '& fieldset:focus': {
        border: 'solid 2px #999999',
      },
      '& .MuiOutlinedInput-input': {
        padding: '.75em 1em !important',
      },
    },
    '& .MuiOutlinedInput-root.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#999999',
      }
    }
  },
  label: {
    top: -5
  },
}));

export default function Option({ label, onChange, selections }){
  const [ value, setValue ] = useState(null)
  const classes = useStyles()
  const theme = useTheme()

  const handleChange = async(event) => {
    setValue(event.target.value)
    await onChange(event.target.value, label)
  }

  const InputSelect = styled(Select)({
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: theme.palette.primary.main,
    '& label': {
      color: theme.palette.primary.secondary,
    },
    '& fieldset': {
        border: 'solid 2px #999999',
      },
      '& .MuiOutlinedInput-input': {
        padding: '.75em 1em !important',
      },
      '&input:hover': {
        backgroundColor: theme.palette.primary.main
      },
      '&input:active': {
        backgroundColor: theme.palette.primary.main
      }
  })

  return(
    <FormControl variant="outlined" className={classes.formControl}>
       <InputLabel className={classes.label}>{label}</InputLabel>
       <InputSelect
         value={value}
         onChange={handleChange}
         label={label}
       >
       {selections.map((option) => (
        <MenuItem value={option.value}>
          {option.label}
        </MenuItem>
       ))}
      </InputSelect>
    </FormControl>
  )
}

import React, { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import { makeStyles, styled } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchIcon from '@material-ui/icons/Search'

const filter = createFilterOptions()

const Adornment = styled(InputAdornment)({
  paddingLeft: 15
})

const AutoFill = styled(Autocomplete)({
  marginLeft: 0,
  marginRight: 100,
  paddingLeft: 0,
  paddingRight: 0
})

const Field = styled(TextField)({
  '& fieldset': {
   background: 'rgba(0, 0, 0, 0.075)',
   borderWidth: 2,
   borderRadius: 10,
  },
  '& .MuiOutlinedInput-input': {
    padding: '5px 15px !important',
    paddingLeft: '5px',
  },
})

const useStyles = makeStyles(({ spacing }) => ({
  search: {
    '&:hover fieldset': {
      borderColor: '#666666 !important',
    },
    '& label': {
      color: 'white',
    },
    '& label.Mui-focused': {
      color: 'white',
    },
    '& input:valid + fieldset': {
      borderWidth: 2,
    },
    '& input:invalid + fieldset': {
      borderColor: 'red',
      borderWidth: 2,
    },
    '& input:valid:focus + fieldset': {
      borderWidth: 2,
      paddingRight: '5px !important',
      paddingLeft: '8px !important',
    }
  },
  href: {
    color: '#333333 !important',
    textDecoration: 'none !important',
  },
}))

export default function FreeSoloCreateOption({ selections }) {
  const [ data, setData ] = useState(subsitute)
  const [ value, setValue ] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    if(Object.keys(selections).length > 0){
      let options = Object.values(selections)
      .map(obj => { return { ...obj } })
      setData(options)
    }
  }, [ selections ])

  return (
    <AutoFill
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            name: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            name: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={data}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name
      }}
      renderOption={(option) =>
        <Link className={classes.href} to={`/index/${option.symbol.toLowerCase()}`}>
          {`${option.name} [${option.symbol}]`}
        </Link>
      }
      style={{
        width: 250
      }}
      freeSolo
      renderInput={(params) => (
        <Field {...params} size='small'
        className={classes.search}
        placeholder='Search...'
        variant='outlined'
        InputProps={{
          ...params.InputProps,
          startAdornment:
          <Adornment position="start">
              <SearchIcon color='secondary' />
            </Adornment>,
          }}
        />
      )}
    />
  )
}

const subsitute = [
  { name: 'NA', symbol: 'NA' },
];

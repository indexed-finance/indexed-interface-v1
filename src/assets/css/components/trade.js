const setStyle = (theme) => ({
  inputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    },
  },
  altInputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 32.5
    }
  },
  swap: {
    textAlign: 'center',
    alignItems: 'center'
  },
  divider: {
    borderTop: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  market: {
    width: '100%',
    color: '#666666',
    borderTop: '#666666 solid 2px',
    borderBottom: '#666666 solid 2px',
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
      color: '#333333'
    }
  },
  helper: {
    cursor: 'pointer'
  }
})

export default { setStyle }

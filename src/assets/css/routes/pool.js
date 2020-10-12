const setStyle = (theme) => ({
  chart: {
  },
  stats: {
    borderTop: '3px solid #666666',
    paddingRight: 30,
    paddingLeft: 30,
    '& ul': {
      listStyle: 'none',
      listStyleType: 'none',
      alignItems: 'left',
      overflow: 'hidden',
      marginRight: 0,
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      '& li': {
        display: 'inline',
        textAlign: 'left',
        float: 'left',
        paddingRight: 37.5
      },
    },
  },
  container: {
    borderBottom: '2px solid #666666',

  },
  events: {
    overflow: 'hidden'
  },
  submit: {
    padding: '12.5px 25px',
    height: 50
  },
  reciept: {
    padding: '10px 12.5px',
    borderBottom: '2px solid #666666',
    width: 'auto',
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
  market: {
    position: 'absolute',
    paddingLeft: '1.75em',
    '& h2': {
      marginBottom: 0
    },
    '& h3': {
      marginTop: 15,
      color: '#999999',
    },
    '& h4': {
      marginTop: 15,
      color: '#999999',
    }
  }
})

const getFormatting = (state) => {
  return {
    marginX: !state.native ? '-13em 0em 0em 3em': '.5em 1.5em',
    margin: !state.native ? '3em 3em': '3em 1.5em',
    width: !state.native ? '100%': '100%',
    padding: !state.native ? 100 : 112.5,
    height: !state.native ? 75 : 200,
    fontSize: !state.native ? 'inherit' : '.875em'
  }
}

export default { setStyle, getFormatting }

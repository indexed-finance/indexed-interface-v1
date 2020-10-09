const setStyle = (theme) => ({
  market: {
    position: 'absolute',
    paddingLeft: '2.5%',
    paddingTop: 0,
    '& h2': {
      marginBottom: 0,
    },
    '& h3': {
      marginTop: 10,
      marginBottom: 5
    },
    '& h4': {
      marginTop: 5,
      color: '#999999',
    }
  },
  options: {
    listStyle: 'none',
    color: '#999999',
    paddingRight: 15,
    paddingLeft: 0,
    paddingTop: 5,
    float: 'right',
    '& li': {
      fontSize: '1vw',
      marginBottom: 7.5,
      '& span': {
        color: theme.palette.secondary.main,
        float: 'right'
      }
    }
  }
})

export default { setStyle }

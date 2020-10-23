const setStyle = (theme) => ({
  root: {
    width: '100vw',
    overflow: 'hidden'
  },
  header: {
    width: '65vw',
    minHeight: '10vh',
    borderBottom: 'solid 3px #666666',
    padding: '0vw 2.5vw',
    display: 'flex'
  },
  title: {
    textTransform: 'capitalize',
    margin: 0
  },
  price: {
    margin: 0
  },
  alternative: {
    margin: 0,
    fontSize: 14,
  },
  delta: {
    color: 'red'
  },
  chart: {
    width: '70vw',
    borderBottom: 'solid 3px #666666',
    height: '55vh'
  },
  sidebar: {
    float: 'right',
    height: '87.5vh',
    width: '30vw',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    marginTop: '-10.5vh',
    alignItems: 'center'
  },
  selections: {
    padding: '1em 6.4em'
  },
  market: {
    padding: '.125em 0em',
    width: '100%',
    color: theme.palette.secondary.main,
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
    }
  },
  nav: {
    marginTop: 12.5,
    marginBottom: 12.5
  }
})

export default { setStyle }

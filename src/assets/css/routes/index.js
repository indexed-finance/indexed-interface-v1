const setStyle = (theme) => ({
  root: {
    overflow: 'hidden',
    maxWidth: '1920px',
    marginLeft: 'auto',
    marginRight:  'auto',
    border: 'solid 3px #666666',
  },
  header: {
    maxWidth: window.innerWidth > 1919 ? '61%' : '64.5%',
    borderBottom: 'solid 3px #666666',
    padding: '.25vw 2.5vw',
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
    width: '70%',
    borderBottom: 'solid 3px #666666',
    height: 'calc(55vh - 52.5px)'
  },
  sidebar: {
    float: 'right',
    height: window.innerWidth > 1919 ? 'calc(75vh - 100px)' : 'fit-content',
    width: '30%',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    marginTop: window.innerWidth > 1919 ? '-5.25vh' :'-8.5vh',
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
    },
    '& .MuiGrid-container': {
      width: '100% !important'
    }
  },
  nav: {
    marginTop: 12.5,
    marginBottom: 12.5
  }
})

export default { setStyle }

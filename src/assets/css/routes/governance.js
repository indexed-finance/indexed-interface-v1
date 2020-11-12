const setStyle = (theme) => ({
  proposals: {
   backgroundColor: theme.palette.background.paper,
   overflow: 'scroll'
 },
 root: {
   width: '100%',
 },
 progress: {
   marginTop: 10,
   marginBottom: 5,
   '& span': {
     marginLeft: 12.5
   }
 },
 chart: {
    paddingTop: 20,
  },
  stats: {
    position: 'absolute',
    paddingLeft: 20,
    '& h3': {
      marginTop: -2.5,
      marginBottom: 0
    },
    '& h4': {
      marginTop: 7.5,
      color: '#999999',
    },
  },
  legend: {
    position: 'absolute',
    paddingLeft: '34%',
    marginTop: -18.75,
    '& ul': {
      padding: 0,
      textAlign: 'right',
      listStyle: 'none',
      '& li': {
        marginBottom: 5
      }
    }
  },
  wallet: {
    height: 230,
    paddingLeft: 25,
    paddingRight: 25,
    '& h4': {
      color: '#666666',
    },
    paddingBottom: 25
  },
  one: {
    width: 10,
    float: 'right',
    height: 10,
    background: '#66FFFF',
    marginLeft: 10,
    marginTop: 3.75
  },
  pie: {
    width: 350,
    padding: 25,
  },
  two: {
    float: 'right',
    width: 10,
    height: 10,
    background: '#00e79a',
    marginLeft: 10,
    marginTop: 3.75
  },
  three: {
    float: 'right',
    width: 10,
    height: 10,
    background: 'orange',
    marginLeft: 10,
    marginTop: 3.75
  },
  create: {
    width: 350,
    paddingRight: 25,
    paddingLeft: 25,
    height: 250
  }
})

const getFormatting = (state) => {
  return {
    height: !state.native ? 110 : 200,
    margin: !state.native ? '3em 3em' : '3em 1.5em',
    width: !state.native ? '100%' : 1000
  }
}

export default { setStyle, getFormatting }

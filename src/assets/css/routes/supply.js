const setStyle = (theme) => ({
  top: {
    marginTop: '3em',
    overflowX: 'hidden'
  },
  modal: {
    width: '30em',
  },
  rewards: {
    padding: '1em 2em',
    '& h2': {
      marginLeft: 50,
      padding: 0
    },
    '& p': {
      margin: 0,
      padding: 0
    }
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  helper: {
    cursor: 'pointer',
    marginBottom: 0
  },
  estimation: {
    listStyle: 'none',
    display: 'inline-block',
    marginTop: -5
  },
  stats: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '& li:first-of-type': {
      marginBottom: 15
    },
    '& li span': {
      float: 'right',
    }
  },
})

const getFormatting = (ticker, native) => {
  return {
    margin: !native ? '3em 3em' : '2em 1.5em',
    padding: !native ?  '0em 2em 1em' : '0em 0em 1em',
    width: ticker.includes('UNIV2') ? 50 : 30,
    marginRight: ticker.includes('UNIV2') ? 7.5 : 0,
    marginBottom: ticker.includes('UNIV2') ? 0 : 10,
    positioning: !native ? 'center' : 'flex-start',
    marginLeft: !native ? '15.5em' : '2.5em',
    inputWidth: !native ? 200 : 125,
    listPadding: !native ? 'inherit' : 0,
    height: !native ? '10em': '11.5em',
    reward: !native ? '34em': 'calc(22.5em - 64px)',
    buttonPos: !native ? -55 : 67.5,
    button: {
       marginTop: !native ? -50 : -37.5,
       marginRight: !native? 25 : -12.5,
    }
  }
}

export default { setStyle, getFormatting }

const setStyle = (theme) => ({
  top: {
    marginTop: '3em'
  },
  modal: {
    width: '30em',
    padding: '1em 2em',
    height: '10em',
  },
  rewards: {
    width: '34em',
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
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em',
    percent: !state.native ? '42.5%' : '150%'
  }
}

export default { setStyle, getFormatting }

const setStyle = (theme) => ({
  category: {
    width: '100%',
    marginBottom: '2.5em'
  },
  divider: {
    borderBottom: '#666666 solid 3px',
  },
  asset: {
    width: 25,
    marginRight: 10
  }
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em',
    percent: !state.native ? '16%' : '70%'
  }
}

export default { setStyle, getFormatting }

const setStyle = (theme) => ({
  category: {
    width: '100%',
    marginBottom: '2.5em'
  },
  title: {
    padding: '0em 2.5em'
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
    margin: !state.native ? '3.5em 3em' : '2em 1.5em'
  }
}

export default { setStyle, getFormatting }

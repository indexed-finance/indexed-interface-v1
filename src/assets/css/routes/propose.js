const setStyle = (theme) => ({
  form: {
    width: '45vw',
    height: 'auto',
    padding: 50,
    paddingBottom: 75
  },
  select: {
    marginBottom: 25
  },
  functions: {
    width: '80%',
    float: 'right'
  },
  item: {
    marginBottom: 50
  },
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em'
  }
}

export default { setStyle, getFormatting }

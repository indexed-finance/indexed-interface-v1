const getFormatting = (state) => {
  return {
    fontSize: !state.native ? '6em' : '3.5em',
    left: !state.native ? '40%' : '7.5%',
    width: !state.native ? '6.5em' : '4.5em',
    marginRight: !state.native ? '2.5em': '1em',
    textWidth: !state.native ? '75%': 'auto',
    secondary: !state.native ? '1em' : '.9em',
    float: !state.native ? 'right' : 'auto'
  }
}

export default { getFormatting }

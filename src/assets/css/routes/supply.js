const setStyle = (theme) => ({
  modal: {
    width: '40em'
  }
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em',
    percent: !state.native ? '42.5%' : '150%'
  }
}

export default { setStyle, getFormatting }

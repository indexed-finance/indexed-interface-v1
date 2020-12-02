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
  '& MuiFormControl-root .MuiInputLabel-animated, .MuiFormLabel-root .Mui-focused ': {
    color: `${document.body.style.color} !important`
  }
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em'
  }
}

export default { setStyle, getFormatting }

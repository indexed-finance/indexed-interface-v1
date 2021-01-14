const setStyle = (theme) => ({
  header: {
    '& a': {
      color: 'orange !important',
      '&:hover': {
        color: '#00e79a !important'
      }
    },
    '& h3': {
      marginLeft: 25
    }
  },
  pool: {
    padding: '1em 2em',
  },
  image: {
    float: 'left',
    marginRight: 25
  },
  information: {
    '& h3': {
      marginTop: 0,
      marginBottom: 0,
      paddingRight: 0
    },
  },
  status: {
    width: '60%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  list: {
    float: 'left',
    listStyle: 'none',
    padding: 0,
  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    textDecoration: 'none !important',
  },
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '4em 0em' : '3em 0em',
    buttonMargin: { margin: 25 }
  }
}

export default { setStyle, getFormatting }

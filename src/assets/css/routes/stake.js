const setStyle = (theme) => ({
  header: {
    '& p': {
      '& a': {
        color: 'orange !important',
        '&:hover': {
          color: '#00e79a !important'
        }
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
    '& h5': {
      marginTop: 10
    }
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
    margin: !state.native ? '3em 3em' : '2em 1.5em',
  }
}

export default { setStyle, getFormatting }

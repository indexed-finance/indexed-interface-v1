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
    width: '25em',
    padding: '1em 2em',
  },
  image: {
    float: 'left',
    marginRight: 25
  },
  information: {
    width: '35em',
    '& h3': {
      marginTop: 0,
      marginBottom: 0,
      paddingRight: 0
    },
    '& h5': {
      marginTop: 10
    }
  }
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '3em 3em' : '2em 1.5em',
    percent: !state.native ? '42.5%' : '150%'
  }
}

export default { setStyle, getFormatting }

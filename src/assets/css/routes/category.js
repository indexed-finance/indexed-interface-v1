const setStyle = (theme) => ({
  tab: {
    borderBottom: 'solid 3px #666666',
    marginRight: 5
  },
  body: {
    padding: '0em 2em',
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
  header: {

  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    textDecoration: 'none !important',
  },
})

const getFormatting = (state) => {
  return {
    margin: !state.native ? '4em 0em' : '3em 0em',
  }
}

export default { setStyle, getFormatting }

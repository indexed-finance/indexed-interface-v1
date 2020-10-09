const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Fransico',
    marginBottom: '6em',
  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    textDecoration: 'none !important',
  },
  menu: {
    position: 'absolute'
  },
  appBar: {
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    padding: theme.spacing(2,0),
    background: theme.palette.primary.main,
    color: theme.palette.secondary.main,
  },
  menuButton: {
    marginRight: theme.spacing(1)
  },
  title: {
    fontFamily: 'San Francisco Bold',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1.5),
    letterSpacing: 5,
    flexGrow: 1,
    float: 'right',
    color: theme.palette.secondary.main
  },
  logo: {
    width: 50,
    marginLeft: theme.spacing(1),
    paddingTop: '.25vh'
  },
  search: {
    '&:hover fieldset': {
      borderColor: '#666666 !important',
    },
    '& label': {
      color: theme.palette.secondary.main
    },
    '& label.Mui-focused': {
      color: theme.palette.secondary.main
    },
    '& input:valid + fieldset': {
      borderWidth: 2,
    },
    '& input:invalid + fieldset': {
      borderColor: 'red',
      borderWidth: 2,
    },
    '& input:valid:focus + fieldset': {
      borderWidth: 2,
      paddingRight: '5px !important',
      paddingLeft: '8px !important',
    }
  },
  profile: {
    float: 'right',
    paddingTop: 2.5
  }
})

export default { setStyle }

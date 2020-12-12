import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Francisco',
  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    fontFamily: 'San Francisco',
    textDecoration: 'none !important',
    '& h3': {
      padding: 0,
      margin: 0,
      marginLeft: 75,
      marginTop: 5
    }
  },
  menu: {
    position: 'absolute'
  },
  logout: {
     position: 'absolute',
     padding: 10,
     top: 25,
     marginLeft: 10,
     fontSize: 25
  },
  nav: {
     display: 'inline-flex',
     marginLeft: 'auto'
  },
  iconButton: {
    marginTop: theme.spacing(.25),
    marginLeft: 50
  },
  appBar: {
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    background: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    paddingRight: '0px !important'
  },
  menuButton: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(.375),
  },
  title: {
    fontFamily: 'San Francisco Bold',
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1.5),
    letterSpacing: 7.5,
    flexGrow: 1,
    float: 'right',
    color: theme.palette.secondary.main
  },
  logo: {
    marginLeft: theme.spacing(1),
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

const mapping = {
  [DESKTOP_SMALL]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    marginLeft: 15,
    titleMargin: 25,
    logoMargin: 7.75,
    marginBottom: '5em',
    width: 37.5,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [DESKTOP_NORMAL]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    marginLeft: 15,
    logoMargin: 6.5,
    titleMargin: 25,
    marginBottom: '5em',
    width: 37.5,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [DESKTOP_LARGE]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    marginLeft: 15,
    marginBottom: '5em',
    logoMargin: 5,
    width: 37.5,
    titleMargin: 25,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [DESKTOP_WIDE]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    marginLeft: 15,
    marginBottom: '5em',
    logoMargin: 2.25,
    titleMargin: 25,
    width: 37.5,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [DESKTOP_HUGE]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    logoMargin: 2.5,
    titleMargin: 25,
    marginBottom: '5em',
    marginLeft: 15,
    width: 37.5,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [DESKTOP_MASSIVE]: {
    paddingTop: '.75vh',
    display: 'INDEXED',
    titleMargin: 25,
    marginLeft: 15,
    marginBottom: '5em',
    logoMargin: -3,
    width: 37.5,
    padding: {
      paddingTop: 12.5,
      paddingBottom: 12.5,
    }
  },
  [NATIVE_SMALL]: {
    paddingTop: '1.5vh',
    display: 'NDX',
    marginLeft: 0,
    marginBottom: '4.5em',
    titleMargin: 15,
    logoMargin: 4.5,
    width: 30,
    padding: {
      paddingTop: 5,
      paddingBottom: 10,
    }
  },
  [NATIVE_NORMAL]: {
    paddingTop: '1.5vh',
    display: 'INDEXED',
    logoMargin: 3.5,
    marginBottom: '4.5em',
    titleMargin: 15,
    marginLeft: 0,
    width: 30,
    padding: {
      paddingTop: 5,
      paddingBottom: 10,
    }
  },
  [NATIVE_WIDE]: {
    paddingTop: '1.5vh',
    display: 'INDEXED',
    marginLeft: 0,
    marginBottom: '4.5em',
    logoMargin: 2.25,
    titleMargin: 15,
    width: 30,
    padding: {
      paddingTop: 5,
      paddingBottom: 10,
    }
  },
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

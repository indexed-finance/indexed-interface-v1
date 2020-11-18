import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    fontFamily: 'San Francisco',
    marginBottom: '6em',
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
  appBar: {
    borderBottom: 'solid 3px #666666',
    boxShadow: 'none',
    padding: theme.spacing(2,0),
    background: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    paddingTop: 12.5,
    paddingBottom: 12.5,
    paddingRight: '0px !important'
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
  [DESKTOP_NORMAL]: {

  },
  [DESKTOP_LARGE]: {

  },
  [DESKTOP_WIDE]: {

  },
  [DESKTOP_HUGE]: {

  },
  [NATIVE_SMALL]: {

  },
  [NATIVE_NORMAL]: {

  },
  [NATIVE_WIDE]: {

  },
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

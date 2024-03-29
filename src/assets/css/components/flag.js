import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    position: 'fixed',
    maxWidth: 400,
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
    '& .MuiAlert-root': {
      background: theme.palette.primary.main,
      color: theme.palette.secondary.main,
      borderWidth: 3
    },
    '& .MuiAlert-outlinedInfo': {
      borderColor: '#66b3ff !important',
      '& .MuiAlert-icon': {
        color: '#66b3ff !important'
      }
    },
    '& .MuiAlert-outlinedSuccess': {
      borderColor: '#00e79a !important',
      '& .MuiAlert-icon': {
        color: '#00e79a !important'
      }
    }
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    bottom: '2.5%',
    left: '2%',
    right: ''
  },
  [DESKTOP_NORMAL]: {
    bottom: '2.5%',
    left: '2%',
    right: ''
  },
  [DESKTOP_LARGE]: {
    bottom: '2.5%',
    left: '2%',
    right: ''
  },
  [DESKTOP_WIDE]: {
    bottom: '2.5%',
    left: '20%',
    right: ''
  },
  [DESKTOP_HUGE]: {
    bottom: '2.5%',
    left: '25%',
    right: ''
  },
  [DESKTOP_MASSIVE]: {
    bottom: '2.5%',
    left: '25%',
  },
  [NATIVE_SMALL]: {
    bottom: '5%',
    left: '7.5%',
    right: '7.5%'
  },
  [NATIVE_NORMAL]: {
    bottom: '5%',
    left: '7.5%',
    right: '7.5%'
  },
  [NATIVE_WIDE]: {
    bottom: '5%',
    left: '7.5%',
    right: '7.5%'
  }
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

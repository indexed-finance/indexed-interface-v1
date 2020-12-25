import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    '& a': {
      color: 'orange !important',
      cursor: 'pointer',
      '&:hover': {
        color: '#00e79a !important'
      }
    },
    '& .MuiDialog-paper': {
      margin: 0
    }
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    inputWidth: 300
  },
  [DESKTOP_NORMAL]: {
    inputWidth: 300
  },
  [DESKTOP_LARGE]: {
    inputWidth: 300
  },
  [DESKTOP_WIDE]: {
    inputWidth: 300
  },
  [DESKTOP_HUGE]: {
    inputWidth: 300
  },
  [DESKTOP_MASSIVE]: {
    inputWidth: 300
  },
  [NATIVE_SMALL]: {
    inputWidth: 'auto'
  },
  [NATIVE_NORMAL]: {
    inputWidth: 'auto'
  },
  [NATIVE_WIDE]: {
    inputWidth: 'auto'
  },
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

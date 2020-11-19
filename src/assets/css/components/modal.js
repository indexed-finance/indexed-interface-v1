import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
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
  [DESKTOP_MASSIVE]: {

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

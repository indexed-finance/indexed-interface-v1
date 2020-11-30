import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: '100%',
  },
  backdrop: {
    zIndex: 10,
    position: 'relative',
    color: '#fff',
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    height: 300,
    width: 500
  },
  [DESKTOP_NORMAL]: {
    height: 450,
    width: 600
  },
  [DESKTOP_LARGE]: {
    height: 450,
    width: 800
  },
  [DESKTOP_WIDE]: {
    height: 500,
    width: 800
  },
  [DESKTOP_HUGE]: {
    height: 500,
    width: 800
  },
  [DESKTOP_MASSIVE]: {
    height: 'calc(25vh - 75px)',
    width: 800
  },
  [NATIVE_SMALL]: {
    height: 'calc(35vh - 75px)',
    width: 800
  },
  [NATIVE_NORMAL]: {
    height: 'calc(35vh - 75px)',
    width: 800
  },
  [NATIVE_WIDE]: {
    height: 'calc(35vh - 75px)',
    width: 800
  }
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

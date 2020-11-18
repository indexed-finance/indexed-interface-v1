import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_SMALL]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 5
  },
  [DESKTOP_NORMAL]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 5
  },
  [DESKTOP_LARGE]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 1
  },
  [DESKTOP_WIDE]: {
    width: 'calc(100% - 55vw)',
    h: 'auto',
    p: -12.5
  },
  [DESKTOP_HUGE]: {
    width: 'calc(100% - 55vw)',
    h: 'auto',
    p: -75
  },
  [NATIVE_SMALL]: {
    width: 'calc(100% - 30vw)',
    h: 125,
    p: 12.5
  },
  [NATIVE_NORMAL]: {
    width: 'calc(100% - 30vw)',
    h: 125,
    p: 12.5
  },
  [NATIVE_WIDE]: {
    width: 'calc(100% - 30vw)',
    h: 125,
    p: 12.5
  }
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { getFormatting }

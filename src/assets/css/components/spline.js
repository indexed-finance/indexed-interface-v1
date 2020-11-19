import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_SMALL]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 8.75
  },
  [DESKTOP_NORMAL]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 11.75
  },
  [DESKTOP_LARGE]: {
    width: 'calc(100% - 30vw)',
    h: 'auto',
    p: 13.75
  },
  [DESKTOP_WIDE]: {
    width: 'calc(100% - 55vw)',
    h: 'auto',
    p: 16.75
  },
  [DESKTOP_HUGE]: {
    width: 'calc(100% - 55vw)',
    h: 'auto',
    p: -40
  },
  [DESKTOP_MASSIVE]: {
    width: 'calc(100% - 55vw)',
    h: 'auto',
    p: -42.5
  },
  [NATIVE_SMALL]: {
    width: 'calc(100% - 30vw)',
    h: 117.5,
    p: 12.5
  },
  [NATIVE_NORMAL]: {
    width: 'calc(100% - 30vw)',
    h: 142.5,
    p: 12.5
  },
  [NATIVE_WIDE]: {
    width: 'calc(100% - 30vw)',
    h: 162.5,
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

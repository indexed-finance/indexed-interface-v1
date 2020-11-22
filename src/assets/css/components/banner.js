import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflowX: 'hidden',
    position: 'absolute',
    borderBottom: '3px solid #666666',
    width: '100vw'
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    show: true,
    inputWidth: 200
  },
  [DESKTOP_NORMAL]: {
    show: true,
    inputWidth: 200
  },
  [DESKTOP_LARGE]: {
    show: true,
    inputWidth: 200
  },
  [DESKTOP_WIDE]: {
    show: true,
    inputWidth: 200
  },
  [DESKTOP_HUGE]: {
    show: true,
    inputWidth: 200
  },
  [DESKTOP_MASSIVE]: {
    show: true,
    inputWidth: 200
  },
  [NATIVE_SMALL]: {
    show: false,
    inputWidth: 137.5
  },
  [NATIVE_NORMAL]: {
    show: true,
    inputWidth: 150
  },
  [NATIVE_WIDE]: {
    show: true,
    inputWidth: 150
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

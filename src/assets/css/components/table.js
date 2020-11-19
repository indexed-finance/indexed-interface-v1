import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: '100%',
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 512.5px)'
  },
  [DESKTOP_NORMAL]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 562.5px)'
  },
  [DESKTOP_LARGE]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 625px)'
  },
  [DESKTOP_WIDE]: {
    overflowX: 'hidden',
    height: 'calc(50vh - 450px)'
  },
  [DESKTOP_HUGE]: {
    overflowX: 'hidden',
    height: 'calc(50vh - 500px)'
  },
  [NATIVE_SMALL]: {
    overflowX: 'scroll',
    height: 'calc(100vh - 350px)'
  },
  [NATIVE_NORMAL]: {
    overflowX: 'scroll',
    height: 'calc(100vh - 367.5px)'
  },
  [NATIVE_WIDE]: {
    overflowX: 'scroll',
    height: 'calc(100vh - 387.5px)'
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

import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: '100%',
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    height: 300
  },
  [DESKTOP_NORMAL]: {
    height: 450
  },
  [DESKTOP_LARGE]: {
    height: 450
  },
  [DESKTOP_WIDE]: {
    height: 500
  },
  [DESKTOP_HUGE]: {
    height: 500
  },
  [DESKTOP_MASSIVE]: {
    height: 'calc(25vh - 75px)'
  },
  [NATIVE_SMALL]: {
    height: 'calc(35vh - 75px)'
  },
  [NATIVE_NORMAL]: {
    height: 'calc(35vh - 75px)'
  },
  [NATIVE_WIDE]: {
    height: 'calc(35vh - 75px)'
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

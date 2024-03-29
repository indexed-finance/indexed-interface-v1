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
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [DESKTOP_NORMAL]: {
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [DESKTOP_LARGE]: {
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [DESKTOP_WIDE]: {
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [DESKTOP_HUGE]: {
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [DESKTOP_MASSIVE]: {
    overflowX: 'hidden',
    height: '300px',
    padding: 'auto'
  },
  [NATIVE_SMALL]: {
    overflowX: 'hidden',
    padding: '20px 16px',
    height: 400
  },
  [NATIVE_NORMAL]: {
    overflowX: 'hidden',
    padding: '20px 16px',
    height: 300
  },
  [NATIVE_WIDE]: {
    overflowX: 'hidden',
    padding: '20px 16px',
    height: 350
  }
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

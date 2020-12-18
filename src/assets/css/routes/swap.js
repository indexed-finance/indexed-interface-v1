import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

 const setStyle = (theme) => ({

 })


const mapping = {
  [DESKTOP_SMALL]: {
  },
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
  }
}

const getFormatting = ({ native }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}


export default { setStyle, getFormatting }

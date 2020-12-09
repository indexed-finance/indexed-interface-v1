import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_SMALL]: {
    border: 3,
    padding: {
      top: 5,
      left: 25,
      right: 25,
      bottom: 0
    }
  },
  [DESKTOP_NORMAL]: {
    border: 3,
    padding: {
      top: 5,
      left: 30,
      right: 30,
      bottom: 0
    }
  },
  [DESKTOP_LARGE]: {
    border: 3,
    padding: {
      top: 40,
      left: 40,
      right: 40,
      bottom: 40
    }
  },
  [DESKTOP_WIDE]: {
    border: 3,
    padding: {
      top: 40,
      left: 40,
      right: 40,
      bottom: 40
    }
  },
  [DESKTOP_HUGE]: {
    border: 3,
    padding: {
      top: 35,
      left: 35,
      right: 35,
      bottom: 35
    }
  },
  [DESKTOP_MASSIVE]: {
    border: 3,
    padding: {
      top: 40,
      left: 40,
      right: 40,
      bottom: 40
    }
  },
  [NATIVE_SMALL]: {
    border: 3,
    padding: {
      top: 15,
      left: 15,
      right: 15,
      bottom: 15
    }
  },
  [NATIVE_NORMAL]: {
    border: 3,
    padding: {
      top: 15,
      left: 15,
      right: 15,
      bottom: 15
    }
  },
  [NATIVE_WIDE]: {
    border: 3,
    padding: {
      top: 15,
      left: 15,
      right: 15,
      bottom: 15
    }
  }
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { getFormatting }

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
      left: 25,
      right: 25,
      bottom: 0
    }
  },
  [DESKTOP_LARGE]: {
    border: 4,
    padding: {
      top: 40,
      left: 40,
      right: 40,
      bottom: 40
    }
  },
  [DESKTOP_WIDE]: {
    border: 4,
    padding: {
      top: 32.5,
      left: 32.5,
      right: 32.5,
      bottom: 32.5
    }
  },
  [DESKTOP_HUGE]: {
    border: 5,
    padding: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30
    }
  },
  [DESKTOP_MASSIVE]: {
    border: 5,
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
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { getFormatting }

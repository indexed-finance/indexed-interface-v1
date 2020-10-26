import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_NORMAL]: {
    border: 3,
    padding: {
      top: 15,
      left: 15,
      right: 15,
      bottom: 0
    }
  },
  [DESKTOP_LARGE]: {
    border: 4,
    padding: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30
    }
  },
  [DESKTOP_WIDE]: {
    border: 4,
    padding: {
      top: 25,
      left: 25,
      right: 25,
      bottom: 25
    }
  },
  [DESKTOP_HUGE]: {
    border: 4,
    padding: {
      top: 30,
      left: 30,
      right: 30,
      bottom: 30
    }
  },
  'NATIVE': {
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
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { getFormatting }

import { DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: '100%',
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 500px)'
  },
  [DESKTOP_NORMAL]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 600px)'
  },
  [DESKTOP_LARGE]: {
    overflowX: 'hidden',
    height: 'calc(100vh - 750px)'
  },
  [DESKTOP_WIDE]: {
    overflowX: 'hidden',
    height: 'calc(50vh - 500px)'
  },
  [DESKTOP_HUGE]: {
    overflowX: 'hidden',
    height: 'calc(50vh - 500px)'
  },
  'NATIVE': {
    overflowX: 'scroll',
    height: 'calc(100vh - 400px)'
  }
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

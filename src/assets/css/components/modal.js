import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
})

const mapping = {
  [DESKTOP_NORMAL]: {

  },
  [DESKTOP_LARGE]: {

  },
  [DESKTOP_WIDE]: {

  },
  [DESKTOP_HUGE]: {

  },
  'NATIVE': {
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

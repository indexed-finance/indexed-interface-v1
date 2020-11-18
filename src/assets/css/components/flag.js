import { DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    position: 'fixed',
    maxWidth: 400,
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
    '& .MuiAlert-root': {
      background: theme.palette.primary.main,
      borderWidth: 3
    }
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    bottom: '2.5%',
    left: '2%',
  },
  [DESKTOP_NORMAL]: {
    bottom: '2.5%',
    left: '2%',
  },
  [DESKTOP_LARGE]: {
    bottom: '2.5%',
    left: '2%',
  },
  [DESKTOP_WIDE]: {
    bottom: '2.5%',
    left: '20%',
  },
  [DESKTOP_HUGE]: {
    bottom: '2.5%',
    left: '25%',
  },
  'NATIVE': {
    bottom: '2.5%',
    left: '7.5%'
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

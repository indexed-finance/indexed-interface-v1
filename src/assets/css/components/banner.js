import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflowX: 'hidden',
    position: 'fixed',
    borderBottom: '3px solid #666666',
    background: theme.palette.primary.main,
  },
  carosuel: {
    listStyle: 'none',
    display: 'inline-flex',
  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    fontFamily: 'San Francisco',
    textDecoration: 'none !important',
    '&:hover': {
      color: '#00e79a !important',
      '& span': {
        color: '#00e79a !important',
      }
    }
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    position: 'fixed',
    duration: 35,
    width: 2500,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    position: 'fixed',
    duration: 35,
    width: 3000,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_LARGE]: {
    position: 'fixed',
    duration: 35,
    width: 4000,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_WIDE]: {
    position: 'fixed',
    duration: 45,
    width: 4000,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_HUGE]: {
    position: 'fixed',
    duration: 45,
    width: 4000,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_MASSIVE]: {
    position: 'fixed',
    duration: 45,
    width: 4000,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_SMALL]: {
    position: 'fixed',
    width: '750vw',
    duration: 30,
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_NORMAL]: {
    position: 'fixed',
    width: '700vw',
    duration: 30,
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_WIDE]: {
    position: 'fixed',
    width: '700vw',
    duration: 25,
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

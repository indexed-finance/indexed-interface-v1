import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflowX: 'hidden',
    position: 'absolute',
    borderBottom: '3px solid #666666',
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
    position: 'absolute',
    duration: 35,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    position: 'absolute',
    duration: 35,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_LARGE]: {
    position: 'absolute',
    duration: 35,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_WIDE]: {
    position: 'absolute',
    duration: 45,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_HUGE]: {
    position: 'absolute',
    duration: 45,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_MASSIVE]: {
    position: 'absolute',
    duration: 45,
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_SMALL]: {
    position: 'fixed',
    width: '600vw',
    duration: 25,
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_NORMAL]: {
    position: 'fixed',
    width: '600vw',
    duration: 30,
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_WIDE]: {
    position: 'fixed',
    width: '600vw',
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

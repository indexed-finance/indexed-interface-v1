import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflowX: 'hidden',
    position: 'fixed',
    background: theme.palette.primary.main,
    zIndex: 10
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
    width: 4500,
    marginBlock: {
      marginBlockStart: '1.3em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    position: 'fixed',
    duration: 35,
    width: 4500,
    marginBlock: {
      marginBlockStart: '1.375em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_LARGE]: {
    position: 'fixed',
    duration: 35,
    width: 4500,
    marginBlock: {
      marginBlockStart: '1.375em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_WIDE]: {
    position: 'fixed',
    duration: 45,
    width: 10000,
    marginBlock: {
      marginBlockStart: '1.375em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_HUGE]: {
    position: 'fixed',
    duration: 45,
    width: 10000,
    marginBlock: {
      marginBlockStart: '1.375em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_MASSIVE]: {
    position: 'fixed',
    duration: 45,
    width: 10000,
    marginBlock: {
      marginBlockStart: '1.375em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_SMALL]: {
    position: 'fixed',
    width: 4500,
    duration: 30,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.25em',
    }
  },
  [NATIVE_NORMAL]: {
    position: 'fixed',
    width: 4500,
    duration: 30,
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.3em',
    }
  },
  [NATIVE_WIDE]: {
    position: 'fixed',
    width: 4500,
    duration: 25,
    marginBlock: {
      marginBlockStart: '.55em',
      marginBlockEnd: '.35em',
    }
  },
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

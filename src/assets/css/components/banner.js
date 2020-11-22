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
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    position: 'absolute',
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    position: 'absolute',
    width: '150vw'
  },
  [DESKTOP_LARGE]: {
    position: 'absolute',
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_WIDE]: {
    position: 'absolute',
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_HUGE]: {
    position: 'absolute',
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [DESKTOP_MASSIVE]: {
    position: 'absolute',
    width: '150vw',
    marginBlock: {
      marginBlockStart: '.5em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_SMALL]: {
    position: 'fixed',
    width: '600vw',
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_NORMAL]: {
    position: 'fixed',
    width: '600vw',
    marginBlock: {
      marginBlockStart: '0em',
      marginBlockEnd: '.5em'
    }
  },
  [NATIVE_WIDE]: {
    position: 'fixed',
    width: '600vw',
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

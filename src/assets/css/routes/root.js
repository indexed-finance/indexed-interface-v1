import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_SMALL]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '22.5px',
        height: '22.5px'
      },
      parent: {
        top: '82.5%',
        left: '5%'
      }
    }
  },
  [DESKTOP_NORMAL]: {
    fontSize: '6em',
    left: '40%',
    width: '6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '22.5px',
        height: '22.5px'
      },
      parent: {
        top: '82.5%',
        left: '5%'
      }
    }
  },
  [DESKTOP_LARGE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '22.5px',
        height: '22.5px'
      },
      parent: {
        top: '82.5%',
        left: '5%'
      }
    }
  },
  [DESKTOP_WIDE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '22.5px',
        height: '22.5px'
      },
      parent: {
        top: '82.5%',
        left: '5%'
      }
    }
  },
  [DESKTOP_HUGE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '22.5px',
        height: '22.5px'
      },
      parent: {
        top: '82.5%',
        left: '5%'
      }
    }
  },
  [NATIVE_SMALL]: {
    fontSize: '3em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: '75%',
    secondary: '.875em',
    float: 'auto',
    nav: '1em',
    indicator: {
      arrows: {
        width: '16px',
        height: '16px'
      },
      parent: {
        top: '82.5%',
        left: '10%'
      }
    }
  },
  [NATIVE_NORMAL]: {
    fontSize: '3.5em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: 'auto',
    secondary: '.9em',
    float: 'auto',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '20px',
        height: '20px'
      },
      parent: {
        top: '82.5%',
        left: '8.75%'
      }
    },
  },
  [NATIVE_WIDE]: {
    fontSize: '3.5em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: 'auto',
    secondary: '.9em',
    float: 'auto',
    nav: '1.25em',
    indicator: {
      arrows: {
        width: '20px',
        height: '20px'
      },
      parent: {
        top: '82.5%',
        left: '7.5%'
      }
    }
  }
}

const getFormatting = ({ native }) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}


export default { getFormatting }

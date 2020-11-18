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
  },
  [DESKTOP_NORMAL]: {
    fontSize: '6em',
    left: '40%',
    width: '6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
  },
  [DESKTOP_LARGE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
  },
  [DESKTOP_WIDE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
  },
  [DESKTOP_HUGE]: {
    fontSize: '6em',
    left: '40%',
    width:'6.5em',
    marginRight: '2.5em',
    textWidth: '75%',
    secondary: '1em',
    float: 'right',
  },
  [NATIVE_SMALL]: {
    fontSize: '3.5em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: 'auto',
    secondary: '.9em',
    float: 'auto'
  },
  [NATIVE_NORMAL]: {
    fontSize: '3.5em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: 'auto',
    secondary: '.9em',
    float: 'auto'
  },
  [NATIVE_WIDE]: {
    fontSize: '3.5em',
    left: '7.5%',
    width: '4.5em',
    marginRight: '1em',
    textWidth: 'auto',
    secondary: '.9em',
    float: 'auto'
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

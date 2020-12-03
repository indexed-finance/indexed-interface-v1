import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const mapping = {
  [DESKTOP_SMALL]: {
    paddingTop: 'calc(100px - .375vh)',
    width: 'calc(100% - 30vw)',
    margin: 70,
    h: 'auto',
    p: 8.75
  },
  [DESKTOP_NORMAL]: {
    paddingTop: 'calc(120px - .25vh)',
    width: 'calc(100% - 30vw)',
    margin: 65,
    h: 'auto',
    p: 11.75
  },
  [DESKTOP_LARGE]: {
    paddingTop: 'calc(125px - .2375vh)',
    width: 'calc(100% - 30vw)',
    margin: 60,
    h: 'auto',
    p: 13.75
  },
  [DESKTOP_WIDE]: {
    paddingTop: 'calc(165px - .5vh)',
    width: 'calc(100% - 55vw)',
    margin: 7.5,
    h: 'auto',
    p: 16.75
  },
  [DESKTOP_HUGE]: {
    paddingTop: 'calc(135px - .35vh)',
    width: 'calc(100% - 55vw)',
    margin: 400,
    h: 'auto',
    p: -40
  },
  [DESKTOP_MASSIVE]: {
    paddingTop: 'calc(150px - .35vh)',
    width: 'calc(100% - 55vw)',
    margin: 450,
    h: 'auto',
    p: -42.5
  },
  [NATIVE_SMALL]: {
    paddingTop: 0,
    width: 'calc(100% - 30vw)',
    margin: 30,
    h: 117.5,
    p: 12.5
  },
  [NATIVE_NORMAL]: {
    paddingTop: 0,
    width: 'calc(100% - 30vw)',
    margin: 30,
    h: 142.5,
    p: 12.5
  },
  [NATIVE_WIDE]: {
    paddingTop: 0,
    width: 'calc(100% - 30vw)',
    margin: 30,
    h: 162.5,
    p: 12.5
  }
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { getFormatting }

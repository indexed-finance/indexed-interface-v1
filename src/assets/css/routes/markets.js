import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  market: {
    position: 'absolute',
    paddingTop: 0,
    '& h2': {
      marginBottom: 0,
    },
    '& h3': {
      marginTop: 10,
      marginBottom: 5
    },
    '& h4': {
      marginTop: 5,
      color: '#999999',
    }
  },
  options: {
    listStyle: 'none',
    color: '#999999',
    paddingRight: 15,
    paddingLeft: 0,
    paddingTop: 5,
    float: 'right',
    '& li': {
      marginBottom: 7.5,
      '& span': {
        color: theme.palette.secondary.main,
        float: 'right'
      }
    }
  }
})


const mapping = {
  [DESKTOP_SMALL]: {
    top: 'calc(100px - .375vh)',
    margin: '0em 3em .25em 3em',
    paddingLeft: 25,
    pre2: 287.5,
    resolution: 200,
    height: '43.75%'
  },
  [DESKTOP_NORMAL]: {
    top: 'calc(120px - .25vh)',
    margin: '0em 3em .25em 3em',
    pre2: 325,
    paddingLeft: 25,
    resolution: 200,
    height: '43.75%'
  },
  [DESKTOP_LARGE]: {
    top: 'calc(125px - .2375vh)',
    margin: '0em 3em .25em 3em',
    paddingLeft: 25,
    pre2: 387.5,
    resolution: 200,
    height: '48.75%'
  },
  [DESKTOP_WIDE]: {
    top: 'calc(165px - .5vh)',
    margin: '0em 3em .25em 3em',
    paddingLeft: 25,
    pre2: 350,
    resolution: 200,
    height: '37.5%'
  },
  [DESKTOP_HUGE]: {
    top: 'calc(135px - .35vh)',
    margin: '0em 3em .25em 3em',
    paddingLeft: 25,
    pre2: 350,
    resolution: 200,
    height: '32.5%'
  },
  [DESKTOP_MASSIVE]: {
    top: 'calc(150px - .35vh)',
    margin: '0em 3em .25em 3em',
    paddingLeft: 25,
    pre2: 390,
    resolution: 200,
    height: '32.5%'
  },
  [NATIVE_SMALL]: {
    top: 'calc(100px + .05vh)',
    margin: '0em 1.5em',
    paddingLeft: 12.5,
    pre2: 'calc(250px - 15vh)',
    resolution: 200,
    height: '35%'
  },
  [NATIVE_NORMAL]: {
    top: 'calc(100px + 2.5vh)',
    paddingLeft: 12.5,
    margin: '0em 1.5em',
    pre2: 'calc(247.5px - 8.125vh)',
    resolution: 200,
    height: '38%'
  },
  [NATIVE_WIDE]: {
    top: 'calc(100px + 4.375vh)',
    paddingLeft: 12.5,
    margin: '0em 1.5em',
    pre2: 'calc(250px - 5.75vh)',
    resolution: 200,
    height: '38%'
  }
}

const getFormatting = ({ request, native, active }) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    pre: !request ? 'auto' : '50%',
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

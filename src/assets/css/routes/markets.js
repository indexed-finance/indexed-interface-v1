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
  pie: {
    position: 'relative',
    float: 'left'
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
    canvasMargin: '5em 3em 1em 3em',
    paddingLeft: 25,
    pre2: 280,
    resolution: 200,
    width: '40%',
    height: '43.75%',
    marginTop: 15
  },
  [DESKTOP_NORMAL]: {
    top: 'calc(120px - .25vh)',
    margin: '0em 3em .25em 3em',
    canvasMargin: '5em 3em 1em 3em',
    pre2: 320,
    paddingLeft: 25,
    resolution: 200,
    width: '40%',
    height: '43.75%',
    marginTop: 60
  },
  [DESKTOP_LARGE]: {
    top: 'calc(125px - .2375vh)',
    margin: '0em 3em .25em 3em',
    canvasMargin: '5em 3em 1em 3em',
    paddingLeft: 25,
    pre2: 387.5,
    resolution: 200,
    width: '40%',
    height: '48.75%',
    marginTop: 120
  },
  [DESKTOP_WIDE]: {
    top: 'calc(165px - .5vh)',
    margin: '0em 3em .25em 3em',
    canvasMargin: '5em 3em 1em 3em',
    paddingLeft: 25,
    pre2: 350,
    resolution: 200,
    width: '40%',
    height: '37.5%',
    marginTop: 80
  },
  [DESKTOP_HUGE]: {
    top: 'calc(135px - .35vh)',
    margin: '0em 3em .25em 3em',
    canvasMargin: '5em 3em 1em 3em',
    paddingLeft: 25,
    pre2: 350,
    resolution: 200,
    width: '40%',
    height: '32.5%',
    marginTop: 75
  },
  [DESKTOP_MASSIVE]: {
    top: 'calc(150px - .35vh)',
    margin: '0em 3em .25em 3em',
    canvasMargin: '5em 3em 1em 3em',
    paddingLeft: 25,
    pre2: 390,
    resolution: 200,
    width: '40%',
    height: '32.5%',
    marginTop: 115
  },
  [NATIVE_SMALL]: {
    top: 'calc(100px + .05vh)',
    canvasMargin: '3.25em 1.5em 1em 1.5em',
    margin: '-.5em 1.5em 1em 1.5em',
    paddingLeft: 12.5,
    pre2: 'calc(250px - 15vh)',
    width: '100%',
    resolution: 200,
    height: '35%'
  },
  [NATIVE_NORMAL]: {
    top: 'calc(100px + 2.5vh)',
    canvasMargin: '3.5em 1.5em 1em 1.5em',
    paddingLeft: 12.5,
    margin: '-.5em 1.5em 1em 1.5em',
    pre2: 'calc(247.5px - 8.125vh)',
    resolution: 200,
    width: '100%',
    height: '38%'
  },
  [NATIVE_WIDE]: {
    top: 'calc(100px + 4.375vh)',
    canvasMargin: '3.5em 1.5em 1em 1.5em',
    paddingLeft: 12.5,
    margin: '-.5em 1.5em 1em 1.5em',
    pre2: 'calc(250px - 5.75vh)',
    width: '100%',
    resolution: 200,
    height: '38%'
  }
}

const getFormatting = ({ request, native, active }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    pre: !request ? 'auto' : '50%',
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

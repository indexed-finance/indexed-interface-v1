import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  market: {
    position: 'absolute',
    paddingLeft: '2.5%',
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
  [DESKTOP_NORMAL]: {
    top: 'calc(100px - .375vw)',
    margin: '-2.5em 3em .25em 3em',
    resolution: 200,
    height: '43.75%'
  },
  [DESKTOP_LARGE]: {
    top: 'calc(100px - .375vw)',
    margin: '1.5em 3em',
    resolution: 200,
    height: '48.75%'
  },
  [DESKTOP_WIDE]: {
    top: 'calc(100px - .375vw)',
    margin: '0em 3em',
    resolution: 200,
    height: '37.5%'
  },
  [DESKTOP_HUGE]: {
    top: 'calc(100px - .375vw)',
    margin: '1.5em 3em',
    resolution: 200,
    height: '32.5%'
  },
  'NATIVE': {
    top: 'calc(100px - .375vw)',
    margin: '.5em 1.5em',
    resolution: 200,
    height: '38%'
  }
}

const getFormatting = ({ request, native }) => {
  let { innerWidth, innerHeight } = window
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)

  return {
    pre2: !request && native ? '25vh' : 'auto',
    pre: !request ? 'auto' : '50%',
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

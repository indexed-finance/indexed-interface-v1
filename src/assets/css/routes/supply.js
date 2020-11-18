import { DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  top: {
    marginTop: '3em',
    overflowX: 'hidden'
  },
  modal: {
    width: '30em',
  },
  rewards: {
    padding: '1em 2em',
    '& h2': {
      marginLeft: 50,
      padding: 0
    },
    '& p': {
      margin: 0,
      padding: 0
    }
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  helper: {
    cursor: 'pointer',
    marginBottom: 0
  },
  estimation: {
    listStyle: 'none',
    display: 'inline-block',
    marginTop: -5
  },
  stats: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '& li:first-of-type': {
      marginBottom: 15
    },
    '& li span': {
      float: 'right',
    }
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    margin: '3em 3em',
    padding: '0em 2em 1em',
    positioning: 'center',
    wallet: '#',
    marginLeft: '167.5px',
    inputWidth: 200,
    listPadding: 'inherit',
    height: '10em',
    reward: '34em',
    buttonPos: -55,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_NORMAL]: {
    margin: '3em 3em',
    padding: '0em 2em 1em',
    positioning: 'center',
    marginLeft: '167.5px',
    inputWidth: 200,
    listPadding: 'inherit',
    height: '10em',
    reward: '34em',
    buttonPos: -55,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_LARGE]: {
    margin: '3em 3em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    listPadding: 'inherit',
    height: '10em',
    reward: '34em',
    buttonPos: -55,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_WIDE]: {
    margin: '3em 3em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    listPadding: 'inherit',
    height: '10em',
    reward: '34em',
    buttonPos: -55,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_HUGE]: {
    margin: '3em 3em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    listPadding: 'inherit',
    height: '10em',
    reward: '34em',
    buttonPos: -55,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  'NATIVE': {
    margin: '2em 1.5em',
    padding: '0em 0em 1em',
    positioning: 'flex-start',
    inputWidth: 125,
    listPadding: 0,
    height: '11.5em',
    reward: 'calc(22.5em - 64px)',
    buttonPos: 67.5,
    button: {
       marginTop: -37.5,
       marginRight: -12.5,
    }
  }
}



const getFormatting = ({ ticker, native }) => {
  let { innerWidth, innerHeight } = window
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)

  return {
    width: ticker.includes('UNIV2') ? 50 : 30,
    marginRight: ticker.includes('UNIV2') ? 7.5 : 0,
    marginBottom: ticker.includes('UNIV2') ? 0 : 10,
    ...mapping[dimension]
  }
}
export default { setStyle, getFormatting }

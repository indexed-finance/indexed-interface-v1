import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  proposals: {
   backgroundColor: theme.palette.background.paper,
   maxHeight: 'calc(40vh - 150px)',
   minHeight: 100,
   overflow: 'scroll'
 },
 root: {
   width: '100%',
 },
 progress: {
   marginTop: 10,
   marginBottom: 5,
   '& span': {
     marginLeft: 12.5
   }
 },
 chart: {
    paddingTop: 20,
  },
  stats: {
    position: 'absolute',
    paddingLeft: 20,
    '& h3': {
      marginTop: -2.5,
      marginBottom: 0
    },
    '& h4': {
      marginTop: 7.5,
      color: '#999999',
    },
  },
  legend: {
    position: 'absolute',
    marginTop: -18.75,
    '& ul': {
      padding: 0,
      textAlign: 'right',
      listStyle: 'none',
      '& li': {
        marginBottom: 5
      }
    }
  },
  wallet: {
    paddingLeft: 25,
    paddingRight: 25,
    '& h4': {
      color: '#666666',
    },
    paddingBottom: 25
  },
  one: {
    width: 10,
    float: 'right',
    height: 10,
    background: '#66FFFF',
    marginLeft: 10,
    marginTop: 3.75
  },
  pie: {
    width: 350,
    padding: 25,
  },
  two: {
    float: 'right',
    width: 10,
    height: 10,
    background: '#00e79a',
    marginLeft: 10,
    marginTop: 3.75
  },
  three: {
    float: 'right',
    width: 10,
    height: 10,
    background: 'orange',
    marginLeft: 10,
    marginTop: 3.75
  },
  create: {
    width: 350,
    paddingRight: 25,
    paddingLeft: 25,
    height: 250
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    wallet: 'calc(150px + 5rem)',
    paddingLeft: '36.75%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [DESKTOP_NORMAL]: {
    wallet: 'calc(200px + 5rem)',
    paddingLeft: '40%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [DESKTOP_LARGE]: {
    wallet: 'calc(267.5px + 5rem)',
    paddingLeft: '42.5%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [DESKTOP_WIDE]: {
    wallet: 'calc(137.5px + 5rem)',
    paddingLeft: '22%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [DESKTOP_HUGE]: {
    wallet: 'calc(225px + 5rem)',
    paddingLeft: '20.5%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [DESKTOP_MASSIVE]: {
    wallet: 'calc(225px + 5rem)',
    paddingLeft: '20.5%',
    margin: '3em 3em',
    height: 110,
    width: '100%'
  },
  [NATIVE_SMALL]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    height: 200,
    width: 1000
  },
  [NATIVE_NORMAL]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    height: 200,
    width: 1000
  },
  [NATIVE_WIDE]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    height: 200,
    width: 1000
  }
}

const getFormatting = ({ native }) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(native, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

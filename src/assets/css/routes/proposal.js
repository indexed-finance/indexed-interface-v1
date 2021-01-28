import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: 'auto'
  },
  proposal: {
    paddingTop: 25,
  },
  body: {
    width: '100%',
    paddingTop: 25,
  },
  markdown: {
    fontSize: 16,
    paddingLeft: 35,
    paddingTop: 20,
    paddingRight: 35,
    '& a': {
      color: 'orange'
    }
  },
  header: {
    borderBottom: '2px solid #666666',
    overflow: 'hidden',
    paddingBottom: 25,
    paddingLeft: 30,
    '& p:first-of-type': {
      fontSize: '.75em',
      marginTop: -30,
      marginLeft: -10
    }
  },
  profile: {
    marginRight: 50
  },
  results: {
    paddingTop: 37.5,
    paddingLeft: 32.5,
    paddingRight: 25,
    paddingBottom: 12.5,
  },
  history: {
    width: 637.5,
    height: 175
  },
  progress: {
    display: 'inline-block',
    marginBottom: 25,
    '& span': {
      marginLeft: 25
    },
  },
  modal: {
    paddingLeft: 25,
    paddingTop: 12.5,
    paddingRight: 25,
    '& label': {
      display: 'block',
      marginBottom: 50,
      fontSize: 18,
    },
    '& p span': {
      color: '#00e79a'
    }
  },
  log: {
    height: 300,
    paddingLeft: 25,
    paddingTop: 12.5,
    paddingRight: 25,
  },
  table: {
    overflowY: 'scroll',
    alignItems: 'center',
    width: '100%'
  },
  title: {
    display: 'inline-block',
    marginLeft: 25,
    '& #active': {
      display: 'inline-block',
    },
    '& h3': {
      float: 'right',
      marginLeft: 25,
      marginTop: 10,
      fontSize: 20
    },
  },
  reciept: {
    color: '#645eff',
    '& span': {
      color: '#666666',
      marginTop: 5
    }
  },
  author: {
    color: '#645eff',
    marginTop: -25
  },
  vote: {
    width: 150,
    float: 'left',
    color: '#999999'
  },
  column: {
    zIndex: 10
  },
  lozenge: {
    float: 'left'
  },
  metadata: {
    lineHeight: 1.5,
    overflow: 'hidden',
    '& p': {
      display: 'contents',
    },
    '& ul': {
      borderTop: '3px solid #666666',
      padding: 0,
      margin: 0,
     '& li': {
       borderBottom: '3px solid #666666',
       listStyle: 'none',
       paddingLeft: 35,
       paddingRight: 35,
       paddingTop: 15,
       paddingBottom: 15,
     },
     '& span': {
       display: 'block',
       float: 'left',
       paddingLeft: 35,
       paddingTop: 27.5,
       paddingRight: 25,
       paddingBottom: 27.5,
     }
    },
    '& a': {
      color: 'orange'
    },
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    margin:'-19em 3em 3em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    paddingLeft: 30
  },
  [DESKTOP_NORMAL]: {
    margin:'-18.5em 3em 3em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    marginTop: -25,
    paddingLeft: 30
  },
  [DESKTOP_LARGE]: {
    margin:'-18em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    marginTop: -25,
    paddingLeft: 30
  },
  [DESKTOP_WIDE]: {
    margin:'-18em 3em 3em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    marginTop: -25,
    paddingLeft: 30
  },
  [DESKTOP_HUGE]: {
    margin:'-20em 3em 3em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    marginTop: -25,
    paddingLeft: 30
  },
  [DESKTOP_MASSIVE]: {
    margin:'-21em 3em 3em 3em',
    marginX:'3em 3em 3em 3em',
    width: 'auto',
    progress: 325,
    radius: 67.5,
    marginTop: -25,
    paddingLeft: 30
  },
  [NATIVE_SMALL]: {
    margin: '1em 1.5em',
    width: '55%',
    marginX:'2em 1.5em 1.5em 1.5em',
    progress: 150,
    radius: 60,
    marginTop: -75,
    paddingLeft: 22.5
  },
  [NATIVE_NORMAL]: {
    margin: '1em 1.5em',
    width: '65%',
    progress: 250,
    marginX:'2em 1.5em 1.5em 1.5em',
    radius: 60,
    marginTop: -15,
    paddingLeft: 22.5
  },
  [NATIVE_WIDE]: {
    margin: '1em 1.5em',
    width: '65%',
    progress: 250,
    marginX:'2em 1.5em 1.5em 1.5em',
    radius: 60,
    marginTop: -15,
    paddingLeft: 22.5
  },
}

const getFormatting = ({ native }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

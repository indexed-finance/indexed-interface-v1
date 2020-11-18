import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

 const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    '& .MuiGrid-container': {
      width: '100% !important',
   }
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    borderBottom: 'solid 2px #666666',
    borderTop: 'solid 2px #666666',
    paddingBottom: 0,
    marginBottom: 25,
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    padding: 0,
    overflowY: 'scroll',
    height: 'calc(20em - 75px)',
    width: '100%'
  },
  item: {
    borderBottom: 'solid 2px #666666',
    paddingBottom: 17.5,
    paddingTop: 17.5,
    fontSize: 12
  },
  first: {
    borderBottom: 'solid 2px #666666',
    fontSize: 12,
    paddingBottom: 17.5,
    paddingTop: 0
  },
  alt: {
    paddingTop: 17.5,
    paddingBottom: 0,
    fontSize: 12
  },
  secondary: {
    root: {
      top: '75%'
    }
  },
  avatar: {
    width: 32.5,
    height: 32.5
  },
  altWrapper: {
    paddingTop: 17.5,
    minWidth: 45,
  },
  wrapper: {
    minWidth: 45,
  },
  text: {
    fontSize: 12,
    marginRight: 7.5
  },
  input: {
    marginTop: 0,
    marginBottom: 12.5,
    width: 250
  },
  market: {
    width: '100%',
    color: '#666666',
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
      color: '#333333'
    }
  },
  single: {
    height: 205
  },
  helper: {
    cursor: 'pointer'
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    width: 'auto'
  },
  [DESKTOP_NORMAL]: {
    width: 'auto'
  },
  [DESKTOP_LARGE]: {
    width: 'auto'
  },
  [DESKTOP_WIDE]: {
    width: 'auto'
  },
  [DESKTOP_HUGE]: {
    width: 'auto'
  },
  [NATIVE_SMALL]: {
    width: '100vw'
  },
  [NATIVE_NORMAL]: {
    width: '100vw'
  },
  [NATIVE_WIDE]: {
    width: '100vw'
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

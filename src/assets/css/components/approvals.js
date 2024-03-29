import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    paddingBottom: 0,
    marginBottom: 0
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
    height: 'auto',
    width: '100%'
  },
  item: {
    borderBottom: 'solid 2px #666666',
    paddingBottom: 25,
    paddingTop: 25,
    height: 100,
    fontSize: 12
  },
  last: {
    paddingBottom: 25,
    paddingTop: 25,
    height: 100,
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
    paddingLeft: 0,
    marginLeft: 0
  },
  text: {
    fontSize: 12,
    marginRight: 7.5
  },
  input: {
    marginTop: 0,
    marginBottom: 12.5,
    marginLeft: 50,
    width: 250
  },
  helper: {
    cursor: 'pointer',
    fontSize: 10,
    marginRight: '0 !important'
  },
  balance: {
    cursor: 'pointer',
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
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    show: true,
    fieldWidth: 200
  },
  [DESKTOP_NORMAL]: {
    show: true,
    fieldWidth: 200
  },
  [DESKTOP_LARGE]: {
    show: true,
    fieldWidth: 200
  },
  [DESKTOP_WIDE]: {
    show: true,
    fieldWidth: 200
  },
  [DESKTOP_HUGE]: {
    show: true,
    fieldWidth: 200
  },
  [DESKTOP_MASSIVE]: {
    show: true,
    fieldWidth: 200
  },
  [NATIVE_SMALL]: {
    show: false,
    fieldWidth: 150
  },
  [NATIVE_NORMAL]: {
    show: true,
    fieldWidth: 167.5
  },
  [NATIVE_WIDE]: {
    show: true,
    fieldWidth: 175
  },
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

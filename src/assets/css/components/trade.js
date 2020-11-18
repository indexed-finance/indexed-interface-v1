import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'

import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  '& .MuidGrid-container': {
    width: '100% !important'
  },
  inputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 16,
      color: `${theme.palette.secondary.main} !important`,
      fontSize: '16px !important'
    },
    marginBottom: 0
  },
  altInputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 14
    },
    marginBottom: 0
  },
  swap: {
    textAlign: 'center',
    alignItems: 'center'
  },
  market: {
    width: '100%',
    color: theme.palette.secondary.main,
    borderTop: '#666666 solid 2px',
    borderBottom: '#666666 solid 2px',
    marginTop: 25,
    marginBottom: 12.5,
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginLeft: 100,
      color: '#999999'
    }
  },
  helper: {
    cursor: 'pointer'
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    width: '30vw'
  },
  [DESKTOP_NORMAL]: {
    width: '30vw'
  },
  [DESKTOP_LARGE]: {
    width: '25vw'
  },
  [DESKTOP_WIDE]: {
    width: '22.5vw'
  },
  [DESKTOP_HUGE]: {
    width: '20vw'
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

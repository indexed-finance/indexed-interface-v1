import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  '& .MuidGrid-container': {
    width: '100% !important'
  },
  inputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    },
    marginBottom: 0
  },
  altInputs: {
    width: 250,
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 32.5
    }
  },
  swap: {
    textAlign: 'center',
    alignItems: 'center'
  },
  divider: {
    borderTop: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  market: {
    width: '100%',
    color: theme.palette.secondary.main,
    borderTop: '#666666 solid 2px',
    borderBottom: '#666666 solid 2px',
    marginTop: 12.5,
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
  }
}

const getFormatting = (native) => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(innerWidth)

  return {
    width: native ? '100vw' : mapping[dimension].width
  }
}

export default { setStyle, getFormatting }

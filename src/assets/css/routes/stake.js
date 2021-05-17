import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({

  header: {
    '& a': {
      color: 'orange !important',
      '&:hover': {
        color: '#00e79a !important'
      }
    },
    '& h3': {
      marginLeft: 25
    }
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex'
  },
  pool: {
    padding: '1em 2em',
    width: '100%',
  },
  image: {
    float: 'left',
    marginLeft: 20,
    marginRight: 25
  },
  information: {
    width: '100%',
    '& h3': {
      marginTop: 0,
      marginBottom: 0,
      paddingRight: 0
    },
  },
  status: {
    width: '100%',
    flexDirection: 'column',
    // marginTop: 25,
    '& > *': {
      display: 'flex',
      marginTop: 10,
    }
  },
  list: {
    float: 'left',
    listStyle: 'none',
    padding: 0,
  },
  href: {
    color: `${theme.palette.secondary.main} !important`,
    textDecoration: 'none !important',
  },
  stakeButton: {
    display: 'flex',
    alignItems: 'flex-end',
    shapeOutside: 'inset(calc(100% - 100px) 0 0)'
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    spacing: 2,
    infoSpacing: 1
  },
  [DESKTOP_NORMAL]: {
    spacing: 2,
    infoSpacing: 4
  },
  [DESKTOP_LARGE]: {
    spacing: 4,
    infoSpacing: 4
  },
  [DESKTOP_WIDE]: {
    spacing: 3,
    infoSpacing: 4
  },
  [DESKTOP_HUGE]: {
    spacing: 3,
    infoSpacing: 4
  },
  [DESKTOP_MASSIVE]: {
    spacing: 3,
    infoSpacing: 4
  },
}

const getFormatting = ({ native }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    margin: !native ? '4em 0em' : '3em 0em',
    buttonMargin: { margin: 25 },
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    width: '69.5%',
    height: 'calc(20em - 100px)',
    padding: 0
  },
  tabs: {
    borderRight: `2px solid #666666`,
    width: 'auto'
  },
  panels: {
    width: '100%',
    padding: 0,
  },
  assets: {
    paddingTop: 7.5,
    overflowY: 'scroll',
    width: '100%',
    height: '100%'
  },
  box: {
    '& .MuiGrid-container': {
      width: '100% !important',
      paddingTop: '2.5%',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

const mapping = {
  [DESKTOP_NORMAL]: {
    height: 'calc(20em - 100px)',
  },
  [DESKTOP_LARGE]: {
    height: '20em'
  },
  [DESKTOP_WIDE]: {
    height: 'calc(20em - 100px)'
  },
  [DESKTOP_HUGE]: {
    height: 'calc(20em - 100px)'
  }
}

const getFormatting = () => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(innerWidth)

  return { ...mapping[dimension] }
}

export default { setStyle, getFormatting }

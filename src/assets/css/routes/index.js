import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflow: 'hidden',
    maxWidth: '1920px',
    marginLeft: 'auto',
    marginRight:  'auto',
  },
  header: {
    borderBottom: 'solid 3px #666666',
    padding: '.25vw 2.5vw',
    display: 'flex'
  },
  title: {
    textTransform: 'capitalize',
    margin: 0
  },
  price: {
    margin: 0
  },
  alternative: {
    margin: 0,
    fontSize: 14,
  },
  delta: {
    color: 'red'
  },
  chart: {
    width: '70%',
    borderBottom: 'solid 3px #666666',
  },
  sidebar: {
    float: 'right',
    width: '30%',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    alignItems: 'center'
  },
  selections: {
    padding: '1em 6.4em'
  },
  market: {
    padding: '.125em 0em',
    width: '100%',
    color: theme.palette.secondary.main,
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
    },
    '& .MuiGrid-container': {
      width: '100% !important'
    }
  },
  nav: {
    marginTop: 12.5,
    marginBottom: 12.5
  }
})

const mapping = {
  [DESKTOP_NORMAL]: {
    width: '64.5%',
    height: 'calc(90vh - 20px)',
    marginTop: '-8.5vh',
    maxWidth: '1920px',
    chart: {
      height: 'calc(55vh - 40px)'
    },
    border: 'none'
  },
  [DESKTOP_LARGE]: {
    width: '63.5%',
    height: '91vh',
    maxWidth: '100%',
    marginTop: '-6.5vh',
    chart: {
      height: 'calc(60vh - 52.5px)'
    },
    border: 'none'
  },
  [DESKTOP_WIDE]: {
    width: '61%',
    height: '70vh',
    maxWidth: '60%',
    marginTop: '-4.5vh',
    chart: {
      height: 'calc(55vh - 52.5px)'
    },
    border: 'solid 3px #666666'
  },
  [DESKTOP_HUGE]: {
    width: '61%',
    height: 'calc(75vh - 100px)',
    marginTop: '-5.25vh',
    maxWidth: '48%',
    chart: {
      height: 'calc(55vh - 52.5px)'
    },
    border: 'solid 3px #666666',
  }
}

const getFormatting = () => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(innerWidth)

  return { ...mapping[dimension] }
}

export default { setStyle, getFormatting }

import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight:  'auto',
  },
  header: {
    borderBottom: 'solid 3px #666666',
    padding: '.25vw 2.5vw',
    display: 'flex'
  },
  alert: {
    textAlign: 'center',
    paddingTop: '10%',
    '& p': {
      width: '45%',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
  },
  href: {
    color: 'orange !important',
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
    alignItems: 'center',
    '& .MuiGrid-container': {
      width: '100% !important'
    },
  },
  selections: {
    paddingTop: '1.25em',
    marginBottom: 12.5
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
  [DESKTOP_SMALL]: {
    width: '64.5%',
    height: 'calc(90vh - 20px)',
    paddingTop: '6.25%',
    marginTop: '-8.5vh',
    maxWidth: '100%',
    marginRight: 50,
    chart: {
      height: 'calc(55vh - 40px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      borderTop: 'none'
    }
  },
  [DESKTOP_NORMAL]: {
    width: '64.5%',
    height: 'calc(93.75vh - 32.5px)',
    paddingTop: '6.5%',
    marginTop: '-8.5vh',
    marginRight: 75,
    maxWidth: '100%',
    chart: {
      height: 'calc(55vh - 40px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      borderTop: 'none'
    }
  },
  [DESKTOP_LARGE]: {
    width: '64.5%',
    height: '91vh',
    paddingTop: '7.75%',
    maxWidth: '100%',
    marginRight: 87.5,
    marginTop: '-6.5vh',
    chart: {
      height: 'calc(60vh - 52.5px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      borderTop: 'none'
    }
  },
  [DESKTOP_WIDE]: {
    width: '62.5%',
    height: '71.25vh',
    maxWidth: '67.5%',
    marginRight: 100,
    paddingTop: '9.375%',
    marginTop: '-4.5vh',
    chart: {
      height: 'calc(55vh - 52.5px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'solid 3px #666666',
      borderLeft: 'solid 3px #666666',
      borderBottom: 'solid 3px #666666'
    }
  },
  [DESKTOP_HUGE]: {
    width: '59.5%',
    height: 'calc(75vh - 50px)',
    paddingTop: '7.375%',
    marginRight: 75,
    marginTop: '-4.5vh',
    maxWidth: '48%',
    chart: {
      height: 'calc(55vh - 52.5px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'solid 3px #666666',
      borderLeft: 'solid 3px #666666',
      borderBottom: 'solid 3px #666666'
    }
  },
  [DESKTOP_MASSIVE]: {
    width: '59.5%',
    height: 'calc(67.5vh - 75px)',
    paddingTop: '7.675%',
    marginRight: 125,
    marginTop: '-3vh',
    maxWidth: '48%',
    chart: {
      height: 'calc(42.5vh - 52.5px)'
    },
    border: {
      borderTop: 'none',
      borderRight: 'solid 3px #666666',
      borderLeft: 'solid 3px #666666',
      borderBottom: 'solid 3px #666666'
    }
  },
  [NATIVE_SMALL]: {

  },
  [NATIVE_NORMAL]: {

  },
  [NATIVE_WIDE]: {
  },
}

const getFormatting = () => {
  let { innerWidth, innerHeight } = window
  let dimension = screenClass(false, innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

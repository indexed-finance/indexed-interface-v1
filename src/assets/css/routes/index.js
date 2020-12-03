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
    padding: '5px 2.5vw 0px 2.5vw',
    display: 'flex',
    '& ul li': {
      paddingTop: 10
    }
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
    width: '57.75%',
    height: 'calc(92.5vh - 20px)',
    paddingTop: '6.25%',
    marginTop: '-8.75vh',
    sideBar: '36.75%',
    showVolume: false,
    maxWidth: '100%',
    marginRight: 50,
    chart: {
      height: 'calc(55vh - 50px)',
      width: '63%',
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
    sideBar: '30%',
    showVolume: true,
    marginRight: 75,
    maxWidth: '100%',
    chart: {
      height: 'calc(55vh - 40px)',
      width: '69.75%',
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
    showVolume: true,
    sideBar: '30%',
    marginRight: 87.5,
    marginTop: '-6.5vh',
    chart: {
      height: 'calc(60vh - 52.5px)',
      width: '69.75%',
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
    marginRight: 75,
    showVolume: true,
    sideBar: '30%',
    paddingTop: '9.375%',
    marginTop: '-4.5vh',
    chart: {
      height: 'calc(55vh - 52.5px)',
      width: '69.75%',
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
    sideBar: '30%',
    showVolume: true,
    marginRight: 50,
    marginTop: '-4.5vh',
    maxWidth: '48%',
    chart: {
      height: 'calc(55vh - 52.5px)',
      width: '69.75%',
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
    height: 'calc(57.5vh - 75px)',
    paddingTop: '7.675%',
    sideBar: '30%',
    showVolume: true,
    marginRight: 50,
    marginTop: '-3vh',
    maxWidth: '48%',
    chart: {
      height: 'calc(42.5vh - 52.5px)',
      width: '69.75%',
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

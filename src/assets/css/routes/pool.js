import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  stats: {
    borderTop: '3px solid #666666',
    paddingRight: 30,
    paddingLeft: 30,
    '& ul': {
      listStyle: 'none',
      listStyleType: 'none',
      alignItems: 'left',
      overflow: 'hidden',
      marginRight: 0,
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      '& li': {
        display: 'inline',
        textAlign: 'left',
        float: 'left',
      },
    },
  },
  events: {
    width: '100%'
  },
  submit: {
    padding: '12.5px 25px',
    height: 50
  },
  alert: {
    padding: '1em 2em',
    borderBottom: '2px solid #666666',
    '& .MuiAlert-outlinedInfo': {
      borderColor: '#66b3ff !important',
      '& .MuiAlert-icon': {
        color: '#66b3ff !important'
      }
    },
    '& label': {
      fontSize: '.9em',
    },
    '& p': {
      margin: 0
    }
  },
  asset: {
    margin: '2em 0em',
  },
  assets: {
    overflowY: 'scroll',
    height: 'calc(25em - 50px)'
  },
  actions: {
    padding: '0em 2em',
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 0
    },
    height: 120
  },
  reciept: {
    padding: '10px 12.5px',
    borderTop: '2px solid #666666',
    borderBottom: '2px solid #666666',
    width: 'auto',
    '& p': {
      fontSize: 14,
    },
    '& p span:last-of-type': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
    }
  },
  market: {
    position: 'absolute',
    paddingLeft: '1.75em',
    '& h2': {
      marginBottom: 0
    },
    '& h3': {
      marginTop: 15,
      color: '#999999',
    },
    '& h4': {
      marginTop: 15,
      color: '#999999',
    }
  },
  targets: {
    '& .first, .item': {
      padding: '.75em 2em',
      borderBottom: '2px solid #666666',
      paddingTop: '1em',
      width: '100%'
    },
    '& .last': {
      padding: '.75em 2em',
    }
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    active: '-22.5em 0em 3em 3em',
    inactive: '-27em 0em 3em 3em',
    margin: '3em 3em',
    percent: '6.75%',
    width: '100%',
    padding: 100,
    paddingRight: 37.5,
    chartHeight: 87.5,
    fullChart: 87.5,
    halfChart: 43.75,
    fontSize: 'inherit',
    balanceHeight: 125
  },
  [DESKTOP_NORMAL]: {
    active: '-18.75em 0em 3em 3em',
    inactive: '-35.75em 0em 3em 3em',
    margin: '3em 3em',
    percent: '6.5%',
    width: '100%',
    padding: 100,
    chartHeight: 87.5,
    fullChart: 87.5,
    halfChart: 43.75,
    paddingRight: 37.5,
    fontSize: 'inherit',
    targetHeight: 100,
    balanceHeight: 125
  },
  [DESKTOP_LARGE]: {
    active: '-17.875em 0em 3em 3em',
    inactive: '-34.25em 0em 3em 3em',
    margin: '3em 3em',
    width: '100%',
    percent: '5.25%',
    padding: 100,
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit',
    paddingRight: 37.5,
    targetHeight: 100,
    balanceHeight: 137.5
  },
  [DESKTOP_WIDE]: {
    active: '-20em 0em 3em 3em',
    inactive: '-39.25em 0em 3em 3em',
    margin: '4em 3em',
    width: '100%',
    padding: 100,
    percent: '5.5%',
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    paddingRight: 37.5,
    fontSize: 'inherit',
    targetHeight: 100,
    balanceHeight: 125
  },
  [DESKTOP_HUGE]: {
    active: '-20.75em 0em 3em 3em',
    inactive: '-39.5em 0em 3em 3em',
    margin: '4em 3em',
    width: '100%',
    percent: '6%',
    padding: 100,
    paddingRight: 37.5,
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit',
    targetHeight: 100,
    balanceHeight: 125
  },
  [DESKTOP_MASSIVE]: {
    active: '-18.5em 0em 3em 3em',
    inactive: '-35.75em 0em 3em 3em',
    margin: '4em 3em',
    width: '100%',
    padding: 100,
    paddingRight: 37.5,
    percent: '5%',
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit',
    targetHeight: 100,
    balanceHeight: 125
  },
  [NATIVE_SMALL]: {
    marginX: '1.5em',
    margin: '2em 1.5em 1em 1.5em',
    width: 'auto',
    percent: '0%',
    padding: 112.5,
    paddingRight: 0,
    chartHeight: 200,
    halfChart: 112.5,
    fontSize: '.875em',
    targetHeight: 175,
    balanceHeight: 187.5
  },
  [NATIVE_NORMAL]: {
    marginX: '1.5em',
    margin: '2em 1.5em 1em 1.5em',
    width: 'auto',
    percent: '0%',
    padding: 112.5,
    paddingRight: 12.5,
    chartHeight: 200,
    halfChart: 100,
    fontSize: '.875em',
    targetHeight: 150,
    balanceHeight: 175
  },
  [NATIVE_WIDE]: {
    marginX: '1.5em',
    margin: '2em 1.5em 1em 1.5em',
    width: 'auto',
    padding: 112.5,
    percent: '0%',
    chartHeight: 200,
    halfChart: 100,
    paddingRight: 12.5,
    fontSize: '.875em',
    targetHeight: 137.5,
    balanceHeight: 175
  }
}

const getFormatting = ({ native, active, request }) => {
  let dimension = screenClass(native, window.innerWidth)
  let { marginX, chartHeight } = mapping[dimension]

  if(!active) {
    if(!native) mapping[dimension].marginX = mapping[dimension].inactive
    mapping[dimension].chartHeight = mapping[dimension].halfChart
  } else if(active) {
    if(!native) mapping[dimension].marginX = mapping[dimension].active
    mapping[dimension].chartHeight = mapping[dimension].fullChart
  }

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

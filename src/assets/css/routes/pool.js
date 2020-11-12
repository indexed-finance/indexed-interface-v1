import { DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE } from '../../constants/parameters'
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
        paddingRight: 37.5
      },
    },
  },
  container: {
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
    '& label': {
      fontSize: '.9em',
    },
    '& p': {
      margin: 0
    }
  },
  asset: {
    margin: '2em 0em'
  },
  assets: {
    height: 250,
    overflowY: 'scroll'
  },
  actions: {
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
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50
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
      height: 100,
      width: '100%'
    },
    '& .last': {
      padding: '.75em 2em',
    }
  }
})

const mapping = {
  [DESKTOP_NORMAL]: {
    marginX: '-15em 0em 0em 3em',
    loading: '-12.5em 0em 0em 3em',
    active: '-15em 0em 0em 3em',
    inactive: '-18.75em 0em 0em 3em',
    tableWidth: 'calc(65em - 412.5px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 87.5,
    fullChart: 87.5,
    halfChart: 43.75,
    fontSize: 'inherit'
  },
  [DESKTOP_LARGE]: {
    marginX: '-17.5em 0em 0em 3em',
    loading: '-17.5em 0em 0em 3em',
    active: '-12.5em 0em 0em 3em',
    inactive: '-27.5em 0em 0em 3em',
    tableWidth: 'calc(65em - 87.5px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit'
  },
  [DESKTOP_WIDE]: {
    marginX: '-30em 0em 0em 3em',
    loading: '-30em 0em 0em 3em',
    active: '-15em 0em 0em 3em',
    inactive: '-37.5em 0em 0em 3em',
    tableWidth: 'calc(50em - 75px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit'
  },
  [DESKTOP_HUGE]: {
    marginX: '-30em 0em 0em 3em',
    loading: '-30em 0em 0em 3em',
    active: '-13.75em 0em 0em 3em',
    inactive: '-37.5em 0em 0em 3em',
    tableWidth: 'calc(50em - 75px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
    fullChart: 75,
    halfChart: 37.5,
    fontSize: 'inherit'
  },
  'NATIVE': {
    marginX: '.5em 1.5em',
    margin: '3em 1.5em',
    width: '100%',
    padding: 112.5,
    chartHeight: 200,
    fontSize: '.875em'
  }
}

const getFormatting = ({ native, active, request }) => {
  let { innerWidth, innerHeight } = window
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)
  let { marginX, chartHeight } = mapping[dimension]

  if(active === null) {
    mapping[dimension].marginX = mapping[dimension].loading
  } else if(request) {
    if(!active) {
      mapping[dimension].chartHeight = mapping[dimension].halfChart
      mapping[dimension].marginX = mapping[dimension].inactive
    } else if(active) {
      mapping[dimension].chartHeight = mapping[dimension].fullChart
      mapping[dimension].marginX = mapping[dimension].active
    }
  }

  console.log(mapping[dimension].chartHeight)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

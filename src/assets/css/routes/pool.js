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
  }
})

const mapping = {
  [DESKTOP_NORMAL]: {
    marginX: '-15em 0em 0em 3em',
    tableWidth: 'calc(65em - 412.5px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 87.5,
    fontSize: 'inherit'
  },
  [DESKTOP_LARGE]: {
    marginX: '-8.75em 0em 0em 3em',
    tableWidth: 'calc(65em - 87.5px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
    fontSize: 'inherit'
  },
  [DESKTOP_WIDE]: {
    marginX: '-11em 0em 0em 3em',
    tableWidth: 'calc(50em - 75px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
    fontSize: 'inherit'
  },
  [DESKTOP_HUGE]: {
    marginX: '-11em 0em 0em 3em',
    tableWidth: 'calc(50em - 75px)',
    margin: '3em 3em',
    width: '100%',
    padding: 100,
    chartHeight: 75,
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

const getFormatting = ({ native }) => {
  let { innerWidth, innerHeight } = window
  let dimension = native ? 'NATIVE' : screenClass(innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

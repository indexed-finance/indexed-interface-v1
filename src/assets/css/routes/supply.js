import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  top: {
    overflowX: 'hidden'
  },
  modal: {
    width: '30em',
  },
  rewards: {
    overflow: 'hidden',
    padding: '1em 2em',
    '& h2': {
      padding: 0
    },
    '& p': {
      margin: 0,
      padding: 0
    }
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  helper: {
    cursor: 'pointer',
    marginBottom: 0
  },
  estimation: {
    listStyle: 'none',
    display: 'inline-block',
    marginTop: -5
  },
  stats: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '& li:first-of-type': {
      marginBottom: 15
    },
    '& li span': {
      float: 'right',
    }
  },
  buttonBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    wallet: '#',
    marginLeft: '167.5px',
    inputWidth: 200,
    claimMargin: 50,
    listPadding: 'inherit',
    height: '12.5em',
    reward: '34em',
    containerPadding: '1em 2em',
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    fontSize: 'auto',
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_NORMAL]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    marginLeft: '167.5px',
    claimMargin: 50,
    inputWidth: 200,
    listPadding: 'inherit',
    containerPadding: '1em 2em',
    height: '10em',
    reward: '34em',
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    fontSize: 'auto',
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_LARGE]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    claimMargin: 50,
    listPadding: 'inherit',
    containerPadding: '1em 2em',
    height: '10em',
    reward: '34em',
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    fontSize: 'auto',
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_WIDE]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    claimMargin: 50,
    listPadding: 'inherit',
    containerPadding: '1em 2em',
    height: '10em',
    reward: '34em',
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    fontSize: 'auto',
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_HUGE]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    listPadding: 'inherit',
    containerPadding: '1em 2em',
    claimMargin: 50,
    height: '10em',
    reward: '34em',
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    fontSize: 'auto',
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [DESKTOP_MASSIVE]: {
    margin: '3em 0em 1.5em 0em',
    padding: '0em 2em 1em',
    positioning: 'center',
    inputWidth: 200,
    listPadding: 'inherit',
    containerPadding: '1em 2em',
    height: '10em',
    reward: '34em',
    fontSize: 'auto',
    claimMargin: 50,
    buttonPos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 17.5
    },
    button2Pos:  {
      marginTop: 15,
      marginBottom: 12.5,
      marginRight: 37.5
    },
    main: 50,
    secondary: 30,
    button: {
       marginTop: -50,
       marginRight: 25,
    }
  },
  [NATIVE_SMALL]: {
    margin: '2em 0em 1.5em 0em',
    padding: '0em 0em 1em 0em',
    positioning: 'flex-start',
    containerPadding: '1em 1.25em',
    inputWidth: 112.5,
    listPadding: 10,
    claimMargin: 0,
    height: '12.75em',
    reward: 'auto',
    buttonPos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 0,
    },
    button2Pos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 0,
    },
    fontSize: '.65em',
    secondary: 22.5,
    main: 30,
    infoWidth: 195,
    button: {
       marginTop: -37.5,
       marginRight: -2.5,
    }
  },
  [NATIVE_NORMAL]: {
    margin: '2em 0em 1.5em 0em',
    padding: '0em 0em 1em 0em',
    positioning: 'flex-start',
    inputWidth: 125,
    containerPadding: '1em 1.5em',
    claimMargin: 0,
    listPadding: 0,
    height: '12.5em',
    reward: 'auto',
    buttonPos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 17.5
    },
    button2Pos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 37.5
    },
    fontSize: '.8em',
    infoWidth: 240,
    secondary: 30,
    main: 40,
    button: {
       marginTop: -40,
       marginRight: -7.5,
    }
  },
  [NATIVE_WIDE]: {
    margin: '2em 0em 1.5em 0em',
    padding: '0em 0em 1em 0em',
    positioning: 'flex-start',
    containerPadding: '1em 2em',
    fontSize: '.875em',
    inputWidth: 125,
    claimMargin: 0,
    listPadding: 0,
    height: '12.5em',
    reward: 'auto',
    infoWidth: 270,
    buttonPos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 10
    },
    button2Pos:  {
      marginTop: 10,
      marginBottom: 0,
      marginRight: 10
    },
    secondary: 30,
    main: 45,
    button: {
       marginTop: -40,
       marginRight: -12.5,
    }
  }
}



const getFormatting = ({ ticker, native }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    width: ticker.includes('UNIV2') ? mapping[dimension].main : mapping[dimension].secondary,
    marginRight: ticker.includes('UNIV2') ? 7 : 0,
    marginBottom: ticker.includes('UNIV2') ? 0 : 10,
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

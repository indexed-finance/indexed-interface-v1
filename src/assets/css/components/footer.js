import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  root: {
    width: 'auto',
    padding: '1.5em 2em',
    position: 'sticky',
    borderTop: '3px solid #666666',
    fontSize: 14,
    bottom: 0
  },
  logo: {
    marginRight: 10,
    marginLeft: 10,
    '& img': {
      verticalAlign: 'bottom',
      borderRadius: '30px',
      background: '#666666',
      padding: 0,
      margin: 0,
      border: '2px solid #666666',
      width: 27.5,
      '&:hover': {
        borderColor: '#00e79a'
      }
    }
  },
  copyright: {
    paddingTop: 12.5
  }
})

const mapping = {
  [DESKTOP_SMALL]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '0em',
      'stake': '10em',
      'supply': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    marginTop: {
      '': '2.5em',
      'categories': '12.5em',
      'governance': '2.5em',
      'index': '0em',
      'stake': '10em',
      'supply': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '7.5em,'
    }
  },
  [DESKTOP_LARGE]: {
    marginTop: {
      '': '2.5em',
      'categories': '25em',
      'governance': '2.5em',
      'index': '0em',
      'stake': '30em',
      'supply': '2.5em',
      'propose': '2.5em',
      'proposal': '20.25em',
      'pool': '20em'
    }
  },
  [DESKTOP_WIDE]: {
    marginTop: {
      '': '18%',
      'categories': '25%',
      'governance': '15.5%',
      'index': '9.7%',
      'stake': '26.75%',
      'supply': '18%',
      'propose': '23.5%',
      'proposal': '22.45%',
      'pool': '20.5%'
    }
  },
  [DESKTOP_HUGE]: {
    marginTop: {
      '': '23.5%',
      'categories': '18.5%',
      'governance': '11.25%',
      'index': '7.25%',
      'stake': '4%',
      'propose': '18%',
      'proposal': '17%',
      'pool': '18%'
    }
  },
  [DESKTOP_MASSIVE]: {
    marginTop: {
      '': '23.5%',
      'categories': '35%',
      'governance': '29.5%',
      'index': '18%',
      'stake': '22%',
      'propose': '18%',
      'proposal': '18%',
      'pool': '32.5%'
    }
  },
  [NATIVE_SMALL]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '3em',
      'stake': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  },
  [NATIVE_NORMAL]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '5em',
      'stake': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  },
  [NATIVE_WIDE]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '5em',
      'stake': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  }
}

const getFormatting = (native) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

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
      'stake': '2.5em',
      'supply': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  },
  [DESKTOP_NORMAL]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '0em',
      'stake': '2.5em',
      'supply': '2.5em',
      'propose': '2.5em',
      'proposal': '2.5em',
      'pool': '2.5em'
    }
  },
  [DESKTOP_LARGE]: {
    marginTop: {
      '': '2.5em',
      'categories': '21em',
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
      'categories': '22.5%',
      'governance': '15%',
      'index': '9.7%',
      'stake': '26.75%',
      'supply': '18%',
      'propose': '23.5%',
      'proposal': '22.45%',
      'pool': '20%'
    }
  },
  [DESKTOP_HUGE]: {
    marginTop: {
      '': '17.75%',
      'categories': '18%',
      'governance': '18%',
      'index': '18%',
      'stake': '18%',
      'supply': '18%',
      'propose': '18%',
      'proposal': '18%',
    }
  },
  [DESKTOP_MASSIVE]: {
    marginTop: {
      '': '18%',
      'categories': '18%',
      'governance': '18%',
      'index': '18%',
      'stake': '18%',
      'supply': '18%',
      'propose': '18%',
      'proposal': '18%',
      'pool': '18%'
    }
  },
  [NATIVE_SMALL]: {
    marginTop: {
      '': '2.5em',
      'categories': '2.5em',
      'governance': '2.5em',
      'index': '3em',
      'stake': '2.5em',
      'supply': '2.5em',
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
      'supply': '2.5em',
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
      'supply': '2.5em',
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

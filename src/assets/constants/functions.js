import { keccak_256, sha3_256 } from 'js-sha3'
import { formatBalance } from '@indexed-finance/indexed.js'
import moment from 'moment';

import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL, tokenMetadata
} from './parameters'

export function getHelperData(arr) {
  if(!arr || arr.length == 0) return []

  return arr.map((value, i) => {
    let props = { ...value }

    if(props.active) {
      let { pool } = props.poolHelper

      props.feesTotalUSD = '$' + parseFloat(pool.feesTotalUSD).toFixed(2)
      props.swapFeeUSD = '%' + formatBalance(pool.swapFee, 18, 4) * 100
    }

    return { ...props }
  })
}

export const filtered = (raw, targets) =>
  Object.keys(raw, targets)
  .filter(key => targets.includes(key))
  .reduce((obj, key) => {
    obj[key] = raw[key];
    return obj;
  }, {})

export function getCategoryImages(category, state) {
  let isSelected = {};
  let categoryImages = [];

  category.indexes.map((index) =>
    state.indexes[index].assets.map((token) => {
      if(isSelected[token.symbol]) return;
      else isSelected[token.symbol] = true;
      return categoryImages.push(
        tokenMetadata[token.symbol].image
      );
    })
  )

  return categoryImages
}

export const parseTimeString = timestamp => {
  let time = moment(timestamp * 1000).fromNow()

  time = time.toUpperCase()
  time = time.replace(/^AN /g, '1 ')
  time = time.replace(/^A /g, '1 ')
  time = time.replace(' HOUR', ' HR')
  time = time.replace(' HOURS', ' HRS')
  time = time.replace(' MINUTES', ' MINS')
  time = time.replace(' MINUTE', ' MIN')

  return time
}

export const toChecksumAddress = (address) => {
  address = address.toLowerCase().replace('0x', '')
  var hash = keccak_256(address);
  var ret = '0x'

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

export const isNative = (instance) => {
  if(!isNaN(parseFloat(instance.width))){
    if(instance.width > 654) return false
    return true;
  }
  return false;
}

export const isAddress = (address) => {
    return address.includes('0x') && address.length == 42
};

export const screenClass = (native, width) => {
  if(!native) {
    if(width <= DESKTOP_SMALL) return DESKTOP_SMALL
    else if(width <= DESKTOP_NORMAL) return DESKTOP_NORMAL
    else if(width > DESKTOP_NORMAL){
      if(DESKTOP_MASSIVE <= width) return DESKTOP_MASSIVE
      else if(width <= DESKTOP_LARGE) return DESKTOP_LARGE
      else if(width <= DESKTOP_WIDE) return DESKTOP_WIDE
      else return DESKTOP_HUGE
    }
  } else {
    if(width <= NATIVE_SMALL) return NATIVE_SMALL
    else if(width <= NATIVE_NORMAL) return NATIVE_NORMAL
    else return NATIVE_WIDE
  }
}

export const getResolutionThresholds = () => {
  if(window.innerWidth >= DESKTOP_HUGE) {
    return [ -(window.innerWidth * 0.375), window.innerWidth ]
  } else if(window.innerWidth >= DESKTOP_LARGE) {
    return [ -(window.innerWidth * 0.875), window.innerWidth ]
  } else if(window.innerWidth > NATIVE_WIDE) {
    return [ -window.innerWidth*2, window.innerWidth  ]
  } else  {
    if(window.innerWidth <= NATIVE_SMALL){
      return [ -(window.innerWidth * 5), window.innerWidth ]
    } else if(window.innerWidth <= NATIVE_NORMAL){
      return [ -(window.innerWidth * 4.5), window.innerWidth ]
    } else {
      return [ -(window.innerWidth * 4.5), window.innerWidth ]
    }
  }
}

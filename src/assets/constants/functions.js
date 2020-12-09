import { keccak_256, sha3_256 } from 'js-sha3'
import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
} from './parameters'

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
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};

export const isChecksumAddress = (address) => {
    // Check each case
    address = address.replace('0x','');
    //var addressHash = sha3(address.toLowerCase());
	var addressHash = sha3_256(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
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
      return [ -(window.innerWidth * 4.25), window.innerWidth ]
    } else {
      return [ -(window.innerWidth * 4.5), window.innerWidth ]
    }
  }
}

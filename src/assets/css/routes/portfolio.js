import {
  DESKTOP_SMALL, DESKTOP_WIDE, DESKTOP_LARGE, DESKTOP_NORMAL, DESKTOP_HUGE, DESKTOP_MASSIVE, NATIVE_WIDE, NATIVE_NORMAL, NATIVE_SMALL
 } from '../../constants/parameters'
 import { screenClass } from '../../constants/functions'

const setStyle = (theme) => ({
  proposals: {
   backgroundColor: theme.palette.background.paper,
  //  overflow: 'scroll'
 },
 root: {
   width: '100%',
 },
 progress: {
   marginTop: 10,
   marginBottom: 5,
   '& span': {
     marginLeft: 12.5
   }
 },
 item: {
   display: 'inline-block',
   width: 200
 },
 weight: {
   width: 200,
 },
 holdings: {
   width: 100
 },
 logo: {
   width: 30
 },
 box: {
   float: 'left',
   width: 75
 },
 usd: {
   marginLeft: 50,
   color: '#666666'
 },
 symbol: {
   marginLeft: 15
 },
 '& h4': {
    marginTop: 7.5,
    color: '#999999',
  },
  account: {
    paddingLeft: 25,
    paddingRight: 25,
    '& h4': {
      color: '#666666',
    },
    '& h1': {
      marginBottom: 0,
      marginTop: 15
    },
    paddingBottom: 25,
    paddingTop: 0
  },
  wallet: {
    paddingLeft: 25,
    paddingRight: 25,
    '& h4': {
      color: '#666666',
    },
    paddingBottom: 25
  },
})

const mapping = {
  [DESKTOP_SMALL]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 375,
  },
  [DESKTOP_NORMAL]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 375,
  },
  [DESKTOP_LARGE]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 375,
  },
  [DESKTOP_WIDE]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 'calc(35vh - 167.5px)'
  },
  [DESKTOP_HUGE]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 'calc(35vh - 150px)'
  },
  [DESKTOP_MASSIVE]: {
    wallet: 150,
    margin: '3em 3em',
    width: '100%',
    tableHeight: 'calc(20vh - 150px)'
  },
  [NATIVE_SMALL]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    width: 1000,
    tableHeight: 300
  },
  [NATIVE_NORMAL]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    width: 1000,
    tableHeight: 300
  },
  [NATIVE_WIDE]: {
    wallet: 'auto',
    margin: '3em 1.5em',
    width: 1000,
    tableHeight: 300
  }
}

const getFormatting = ({ native }) => {
  let dimension = screenClass(native, window.innerWidth)

  return {
    ...mapping[dimension]
  }
}

export default { setStyle, getFormatting }

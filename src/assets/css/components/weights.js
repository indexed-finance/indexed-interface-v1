const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    fontSize: 12,
  },
  altTitle: {
    fontSize: 15,
  },
  title: {
    fontSize: 15,
    maxWidth: '15em',
    display: 'inline-block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    '& div:first-of-type': {
      textOverflow: 'ellipsis',
      display: 'inline-block',
      overflow: 'hidden',
      maxWidth: '10em',
    },
    '& span': {
      float: 'right',
      display: 'inline-block'
    }
  },
  percentage: {
    float: 'right'
  },
  asset: {
    marginTop: 10,
    width: 50
  },
  symbol: {
    marginLeft: 5,
  },
  alternative: {
    color: '#999999'
  },
  wrapper: {
    float: 'left',
    marginRight: 20
  }
})

export default { setStyle }

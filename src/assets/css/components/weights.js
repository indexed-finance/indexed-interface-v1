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
      display: 'inline-block',
      marginLeft: 5,
    }
  },
  percentage: {
    float: 'right'
  },
  asset: {
    width: 50,
    height: 50
  },
  alternative: {
    color: '#999999'
  },
  etherscanLink: {
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.06)'
    }
  },
  wrapper: {
    float: 'left',
    marginRight: 20,
    '& > a': {
      padding: '2.5px !important',
    }
  }
})

export default { setStyle }

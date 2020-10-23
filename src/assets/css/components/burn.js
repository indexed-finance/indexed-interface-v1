const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    width: 350,
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  item: {
    borderBottom: 'solid 2px #666666',
    paddingBottom: 17.5,
    paddingTop: 17.5,
    fontSize: 12
  },
  single: {
    paddingTop: 20,
    paddingLeft: 75
  },
  divider: {
    borderTop: '#666666 solid 1px',
    borderBottom: '#666666 solid 1px',
    margin: '1.5em 0em 1.5em 0em',
    width: '27.5em',
  },
  first: {
    borderBottom: 'solid 2px #666666',
    fontSize: 12,
    paddingBottom: 17.5,
    paddingTop: 0
  },
  container: {
    borderBottom: 'solid 2px #666666',
    borderTop: 'solid 2px #666666',
    height: 'calc(20em - 87.5px)',
    margin: 0,
    padding: 0
  },
  alt: {
    paddingTop: 17.5,
    paddingBottom: 0,
    fontSize: 12
  },
  radio: {
    marginBottom: 20
  },
  reciept: {
    paddingTop: 25,
  },
  secondary: {
    root: {
      top: '75%'
    }
  },
  header: {
    borderBottom: 'solid 2px #666666',
  },
  avatar: {
    width: 32.5,
    height: 32.5
  },
  altWrapper: {
    paddingTop: 17.5,
    minWidth: 45,
  },
  wrapper: {
    minWidth: 45,
  },
  text: {
    fontSize: 12,
    marginRight: 7.5
  },
  input: {
    marginTop: 0,
    marginBottom: 12.5,
    width: 250
  },
  table: {
  },
  market: {
    paddingTop: '.5em',
    width: '100%',
    color: '#666666',
    '& p': {
      fontSize: 14,
      marginLeft: 12.5
    },
    '& p span': {
      float: 'right',
      fontFamily: "San Francisco Bold",
      fontWeight: 500,
      marginRight: 50,
      color: '#333333'
    }
  },
  helper: {
    cursor: 'pointer'
  }
})

export default { setStyle }

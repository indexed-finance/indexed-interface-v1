const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    width: '69.5%',
    height: 150,
    padding: 0
  },
  tabs: {
    borderRight: `2px solid #666666`,
    width: 'auto'
  },
  panels: {
    width: '100%',
    padding: 0,
  },
  assets: {
    paddingTop: 7.5,
    overflowY: 'scroll',
    width: '100%'
  },
  box: {
    '& .MuiGrid-container': {
      width: window.innerWidth > 1920 ? '75% !important': 'inherit !important',
      paddingTop: '2.5%',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

export default { setStyle }

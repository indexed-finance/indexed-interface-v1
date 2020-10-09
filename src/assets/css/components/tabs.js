const setStyle = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: 150,
    padding: 0
  },
  tabs: {
    borderRight: `2px solid #666666`,
    width: 'auto'
  },
  panels: {
    width: '100%',
    padding: 0
  },
  assets: {
    paddingTop: 7.5,
    overflowY: 'scroll',
    width: '100%'
  }
})

export default { setStyle }

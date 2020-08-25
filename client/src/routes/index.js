import React, { Fragment } from 'react'

import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import Area from '../components/charts/area'

const useStyles = makeStyles((theme) => ({
  header: {
    width: '70vw',
    height: '10vh',
    borderBottom: 'solid 3px #666666',
  },
  title: {
    padding: '.75em 1.25em',
    textTransform: 'capitalize',
    margin: 0
  },
  chart: {
    width: '70vw',
    borderBottom: 'solid 3px #666666',
    height: '55vh'
  },
  sidebar: {
    float: 'right',
    height: '100vh',
    width: '30vw',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    marginTop: '-10.5vh'
  }
}));

export default function Index(){
  let { name } = useParams()
  const classes = useStyles()

  return (
    <Fragment>
      <div className={classes.header}>
        <h2 className={classes.title}> {name} </h2>
      </div>
      <div className={classes.sidebar}>

      </div>
      <div className={classes.chart}>
        <Area />
      </div>
    </Fragment>
  )
}

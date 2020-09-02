import React, { Fragment } from 'react'

import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Area from '../components/charts/area'
import Tabs from '../components/tabs'

const useStyles = makeStyles((theme) => ({
  header: {
    width: '65vw',
    minHeight: '10vh',
    borderBottom: 'solid 3px #666666',
    padding: '0vw 2.5vw',
    display: 'flex'
  },
  title: {
    textTransform: 'capitalize',
    margin: 0
  },
  price: {
    margin: 0
  },
  alternative: {
    margin: 0,
    fontSize: 14,
  },
  delta: {
    color: 'red'
  },
  chart: {
    width: '70vw',
    borderBottom: 'solid 3px #666666',
    height: '55vh'
  },
  sidebar: {
    float: 'right',
    height: '87.5vh',
    width: '30vw',
    borderLeft: 'solid 3px #666666',
    top: 0,
    clear: 'both',
    marginTop: '-10.5vh'
  },
}));

export default function Index(){
  let { name } = useParams()
  const classes = useStyles()

  return (
    <Fragment>
      <div className={classes.header}>
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <h3 className={classes.title}> {name} [CCI]</h3>
          </Grid>
          <Grid item>
            <h4 className={classes.price}> $5,410.23 <span className={classes.delta}>(%0.42)</span></h4>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>Marketcap: $50,313,217.33</span>
          </Grid>
          <Grid item>
            <span className={classes.alternative}>Volume: $100,101,333.51</span>
          </Grid>
        </Grid>
      </div>
      <div className={classes.sidebar}>

      </div>
      <div className={classes.chart}>
        <ParentSize>
          {({ width, height }) =>
          <Area width={width} height={height} />
          }
        </ParentSize>
      </div>
      <div className={classes.metrics}>
        <Tabs />
      </div>
    </Fragment>
  )
}

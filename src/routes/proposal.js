import React, { Fragment, useEffect } from 'react'

import { makeStyles, styled, withStyles } from '@material-ui/core/styles'
import ParentSize from '@vx/responsive/lib/components/ParentSize'
import Grid from '@material-ui/core/Grid'
import Lozenge from '@atlaskit/lozenge'
import jazzicon from '@metamask/jazzicon'
import LinearProgress from '@material-ui/core/LinearProgress'

import Donut from '../components/charts/donut'
import Heatmap from '../components/charts/heatmap'
import Container from '../components/container'
import Canvas from '../components/canvas'

const Card = styled(Canvas)({
  marginTop: '1.5em',
  marginRight: '1.5em'
})

const Log = styled(Canvas)({
  marginTop: '1.5em',
  marginLeft: 0
})

const useStyles = makeStyles((theme) => ({
  root: {
    width: 'auto'
  },
  proposal: {
    paddingTop: 25,
    width: 850
  },
  pie: {
    paddingTop: 25,
    paddingBottom: 25
  },
  heatmap: {
    width: 200,
    height: 200,
    marginTop: -26.75,
    marginRight: -12.5,
    '& svg': {
      transform: 'rotate(-.05deg)'
    }

  },
  header: {
    borderBottom: '2px solid #666666',
    overflow: 'hidden',
    paddingBottom: 25,
    paddingLeft: 30
  },
  profile: {
    marginRight: 50
  },
  results: {
    paddingTop: 37.5,
    paddingLeft: 32.5,
    paddingRight: 25,
    paddingBottom: 12.5,
  },
  history: {
    width: 637.5,
    height: 175
  },
  progress: {
    display: 'inline-block',
    marginBottom: 25,
    '& span': {
      marginLeft: 25
    },
  },
  modal: {
    width: 300,
    height: 100,
  },
  log: {
    width: 300,
    height: 100,
  },
  title: {
    display: 'inline-block',
    marginLeft: 25,
    '& #active': {
      display: 'inline-block',
    },
    '& h3': {
      float: 'right',
      marginLeft: 25,
      marginTop: 10,
      fontSize: 20
    },
  },
  reciept: {
    color: '#645eff',
    '& span': {
      color: '#666666',
      marginTop: 5
    }
  },
  vote: {
    width: 150,
    float: 'left',
    color: '#999999'
  },
  column: {
    float: 'right',
    height: ''
  }
}))

let ADDRESS = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd"

const ProgressFor = withStyles((theme) => ({
  root: {
    height: 15,
    borderRadius: 10,
    width: 325,
    float: 'left'
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#00e79a',
  },
}))(LinearProgress)

const ProgressAgainst = withStyles((theme) => ({
  root: {
    height: 15,
    borderRadius: 10,
    width: 325,
    float: 'left'
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#ff005a',
  },
}))(LinearProgress)

export default function Proposal(){
  const classes = useStyles()


  function Blockie({ address }) {
    let classes = useStyles()

    useEffect(() => {
      let element = document.getElementById('blockie')
      let parsed =  parseInt(address.slice(2, 10), 16)
      let blockie = jazzicon(67.5, parsed)

      blockie.style.float = 'left'
      blockie.style.borderRadius = '50px'
      blockie.style.border = '5px solid #666666'

      element.appendChild(blockie)
    }, [])

    return(
      <div className={classes.profile}>
        <a target='_blank' href={`https://etherscan.io/address/${address}`}>
          <div id="blockie" />
        </a>
      </div>
    )
  }

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-evenly'>
        <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item>
            <Canvas margin='3em'>
              <div className={classes.proposal}>
                <div className={classes.header}>
                  <Blockie address={ADDRESS} />
                  <div className={classes.title}>
                  <div id='active'>
                    <Lozenge isBold>
                      ACTIVE
                    </Lozenge>
                  </div>
                  <h3> New category; Governance </h3>
                  <div className={classes.reciept}>
                    <span>{ADDRESS.substring(0, 6)}...{ADDRESS.substring(38, 64)} • </span> 1D, 23HRS REMAINING
                  </div>
                </div>
              </div>
              <div className={classes.results}>
                <div className={classes.option}>
                  <div className={classes.vote}> AGAINST </div>
                  <span className={classes.progress}>
                    <ProgressAgainst variant="determinate" value={30} /> <span> 5,233.00 NDX</span>
                  </span>
                </div>
                <div className={classes.option}>
                  <div className={classes.vote}> FOR </div>
                  <span className={classes.progress}>
                    <ProgressFor variant="determinate" value={70} /> <span> 25,196.41 NDX </span>
                  </span>
                </div>
              </div>
            </div>
          </Canvas>
          </Grid>
          <Grid item>
            <div className={classes.column}>
            <Canvas>
              <div className={classes.modal}>

              </div>
            </Canvas>
            <Card>
             <div className={classes.log}>

            </div>
          </Card>
            </div>
          </Grid>
        </Grid>
        <Grid item container direction='row' alignItems='flex-start' justify='flex-start'>
          <Grid item>
            <Card>
              <div className={classes.heatmap}>
                <ParentSize>
                  {({ width, height }) => <Heatmap width={width} height={height} /> }
                </ParentSize>
              </div>
            </Card>
          </Grid>
          <Grid item>
            <Log>
              <div className={classes.history}>
                TEST
              </div>
            </Log>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  )
}

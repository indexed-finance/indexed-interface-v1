import React, { Fragment, useState, useEffect, useContext } from "react"

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { styled, makeStyles, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Checkbox from '@material-ui/core/Checkbox'
import Avatar from '@material-ui/core/Avatar'
import Lozenge from '@atlaskit/lozenge'
import LinearProgress from '@material-ui/core/LinearProgress'
import { useHistory } from "react-router-dom";

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Select from '../components/inputs/select'
import Canvas from '../components/canvas'
import Stacked from '../components/charts/stacked'

import { store } from '../state'

const selections = [[{ value: 0, label: null }]];

const Liquidity = styled(Button)({
  border: '2px solid #009966',
  color: '#999999',
  borderRadius: 5,
  padding: '.5em 2.5em',
  '&:hover': {
    color: '#009966',
    fontWeight: 'bold'
  }
})

const getPhase = phase => {
  if(phase == 'passed') return 'positive'
  else if(phase == 'rejected') return 'removed'
  else if(phase == 'active') return 'new'
  else if(phase == 'executed') return 'inprogress'
}

const ProgressFor = withStyles((theme) => ({
  root: {
    height: 12.5,
    borderRadius: 10,
    width: 200,
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
    height: 12.5,
    borderRadius: 10,
    width: 200,
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

const AddressInput = styled(Input)({
  marginTop: 0,
  marginBottom: 7.5,
  width: '100%'
})

const ListWrapper = styled(List)({
  height: 'calc(100vh - 475px)',
  flex: '1 1 auto',
  overflowY: 'scroll'
})

const Item = styled(ListItem)({
  borderBottom: '2px solid #666666',
  height: 100,
  '& label': {
    fontSize: 17.5
  }
})

const SecondaryAction = styled(ListItemSecondaryAction)({
  '& label': {
    color: '#999999'
  }
})

const ListAvatar = styled(ListItemAvatar)({
  marginRight: 25
})

const useStyles = makeStyles((theme) => ({
  proposals: {
   backgroundColor: theme.palette.background.paper,
   width: 'auto'
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
 chart: {
    paddingTop: 20,
    height: 200,
    width: 750
  },
  stats: {
    position: 'absolute',
    paddingLeft: 20,
    '& h3': {
      marginTop: -2.5,
      marginBottom: 0
    },
    '& h4': {
      marginTop: 7.5,
      color: '#999999',
    },
  },
  legend: {
    position: 'absolute',
    paddingLeft: '35em',
    marginTop: -18.75,
    '& ul': {
      padding: 0,
      textAlign: 'right',
      listStyle: 'none',
      '& li': {
        marginBottom: 5
      }
    }
  },
  wallet: {
    width: 350,
    height: 250,
    paddingLeft: 25,
    paddingRight: 25,
    '& h4': {
      color: '#666666',
      '& span': {
        color: '#00e79a'
      }
    },
  },
  one: {
    width: 10,
    float: 'right',
    height: 10,
    background: '#66FFFF',
    marginLeft: 10,
    marginTop: 3.75
  },
  pie: {
    width: 350,
    padding: 25,

  },
  two: {
    float: 'right',
    width: 10,
    height: 10,
    background: '#00e79a',
    marginLeft: 10,
    marginTop: 3.75
  },
  three: {
    float: 'right',
    width: 10,
    height: 10,
    background: 'orange',
    marginLeft: 10,
    marginTop: 3.75
  },
  create: {
    width: 350,
    paddingRight: 25,
    paddingLeft: 25,
    height: 250
  },
}))

export default function Governance(){
  const [ proposals, setProposals ] = useState([])
  const [ chart, setChart ] = useState(<span/>)
  const history = useHistory()
  const classes = useStyles()

  let { dispatch, state } = useContext(store)

  const renderChart = () => {
    return(
      <Stacked />
    )
  }

  const renderActivate = () => {
    return(
      <p> You have not setup your wallet for voting yet,
        either for individual voting, or delegation.
      </p>
    )
  }

  useEffect(() => {
    setChart(renderChart())
    setProposals(state.proposals)
  }, [])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid>
            <Canvas>
              <div className={classes.wallet}>
                <h3> BALANCE: 1,541.09 NDX </h3>
                <h4> STATUS: <span>ACTIVE</span></h4>
                <p> Allocate your votes to another address:</p>
                <AddressInput variant="outlined" label='ADDRESS'/>
                <ButtonPrimary> DELEGATE </ButtonPrimary>
              </div>
            </Canvas>
          </Grid>
          <Grid item>
            <Canvas>
              <div className={classes.chart}>
                <div className={classes.stats}>
                  <h3> TOTAL VOTERS: 384</h3>
                  <h4> SHARE VALUE: $250.34</h4>
                </div>
                <div className={classes.legend}>
                  <ul>
                    <li> 50,124.35 NDX<div className={classes.one}/> </li>
                    <li> 15,433.07 NDX<div className={classes.two}/></li>
                    <li> 680.44 NDX<div className={classes.three}/> </li>
                  </ul>
                </div>
                {chart}
              </div>
            </Canvas>
          </Grid>
        </Grid>
        <Grid item className={classes.root}>
          <Container margin='3em 3em' padding="1em 2em" title='PROPOSALS' percentage='15%'>
            <ListWrapper dense className={classes.proposals}>
              {Object.entries(proposals).map(([key, value], index) => {
                let f = () => history.push(`/proposal/${key}`)

                return (
                  <Item key={key} button onClick={f}>
                    <ListItemText primary={<label>{value.title}</label>}
                      secondary={
                        <div id={value.phase}>
                          <Lozenge isBold>
                            {value.phase}
                            </Lozenge>
                          <o> {Object.keys(proposals).length - (parseInt(index) + 1)} • {value.time}</o>
                        </div>
                      }
                    />
                    <ListItemText
                      primary={
                        <div className={classes.progress}>
                          <ProgressFor variant="determinate" value={value.yes} /> <span> {value.for}</span>
                        </div>
                      }
                      secondary={
                        <div className={classes.progress}>
                          <ProgressAgainst variant="determinate" value={value.no} /> <span> {value.against}</span>
                        </div>
                      }
                    />
                    <SecondaryAction>
                      {value.action && (
                        <ButtonPrimary variant='outlined'>
                          {value.label}
                        </ButtonPrimary>
                      )}
                      {!value.action && (
                        <label> {value.label}</label>
                      )}
                    </SecondaryAction>
                  </Item>
                );
              })}
            </ListWrapper>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

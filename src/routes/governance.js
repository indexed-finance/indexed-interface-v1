import React, { Fragment, useState, useEffect, useContext } from "react"

import ParentSize from '@vx/responsive/lib/components/ParentSize'
import { styled, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Input from '../components/inputs/input'
import Select from '../components/inputs/select'
import Donut from '../components/charts/donut'
import Canvas from '../components/canvas'
import List from '../components/list'
import Stacked from '../components/charts/stacked'

import { store } from '../state'

const selections = [[{ value: 0, label: null }]];

const columns = [
  { id: 'name', label: 'Name', minWidth: 200 },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'center',
    format: (value) => `$${value.toLocaleString('en-US')}`,
  },
  {
    id: 'eoy',
    label: 'EOY',
    minWidth: 50,
    align: 'center',
    format: (value) => `${value.toLocaleString('en-US')}%`,
  },
  {
    id: 'action',
    minWidth: 150,
    align: 'center',
  },
];

function createData(name, price, eoy, liquidity ) {
  return { name, price, eoy, liquidity };
}

const rows = [
  createData('Change swap fee to 5%', 7232.23, 4.34, 125000.18),
  createData('Reduce NDX inflation to 1%', 10553.11, 2.11, 100232.18),
  createData('New market strategy ', 25731.23, 1.12, 75000.11),
];

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

const AddressInput = styled(Input)({
  marginTop: 0,
  marginBottom: 7.5,
  width: '100%'
})

const Card = styled(Canvas)({
  marginRight: 0
})

const useStyles = makeStyles(() => ({
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
  }
}))

export default function Governance(){
  const [ chart, setChart ] = useState(<span/>)
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
  }, [])

  return (
    <Fragment>
      <Grid item direction='column' alignItems='flex-start' justify='space-between'>
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
        <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item>
            <Card>
              <div className={classes.pie}>
                <Donut />
              </div>
            </Card>
          </Grid>
          <Grid item>
            <Container margin='3em' title='PROPOSALS' percentage='25%'>
              <List height='100%' data={rows} columns={columns} />
            </Container>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  )
}

import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import ExitIcon from '@material-ui/icons/ExitToApp'

import Container from '../components/container'
import Spline from '../components/charts/spline'
import Canvas from '../components/canvas'
import Approvals from '../components/approvals'
import List from '../components/list'
import TransactionButton from '../components/buttons/transaction'

import { eventColumns } from '../assets/constants/parameters'
import { store } from '../state'

const dummy = {
    address: '0x0000000000000000000000000000000000000000',
    assets: [ ],
    name: '',
    symbol: '',
    price: '',
    supply: '',
    marketcap: '',
    history: []
}

function hash(value, og) {
  return (
    <a style={{ 'text-decoration': 'none' }} href={`https://rinkeby.etherscan.io/tx/${og}`} target='_blank'>
      <TransactionButton> <o>{value}</o>&nbsp;<Exit/> </TransactionButton>
    </a>
  )
}

const shortenHash = receipt => {
  let length = receipt.length
  let z4 = receipt.substring(0, 4)
  let l4 = receipt.substring(length-4, length)
  return `${z4}...${l4}`
}

let txs = [
  '0x28ee0d9d6546d7490b3b6cf5227bd4018e7c6fc00af3f702bf145c8233a5e929',
  '0x1e4fc4b6062f33788c4658f7b223c736ce9752e754115e2a49208d019513e28c',
  '0xe6858db4c58879821936c5a88df647251814c0520a5da5d2afd8c26a946bed04',
  '0xcd5edd521b1b3b7511b3e968e3d322c875d1cd17b13cd89c9a74fd9086d005f8',
  '0xa9a01f59b454058d700253430ee234794bde8e04dbe5bb03c10133192543bc09'
]

const Chart = styled(Canvas)({
  marginRight: 0
})

const Exit = styled(ExitIcon)({
  fontSize: '1rem'
})

const useStyles = makeStyles((theme) => ({
  chart: {
    width: '45em',
  },
  stats: {
    borderTop: '3px solid #666666',
    paddingRight: 30,
    paddingLeft: 30,
    '& ul': {
      listStyle: 'none',
      listStyleType: 'none',
      alignItems: 'left',
      overflow: 'hidden',
      marginRight: 0,
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      '& li': {
        display: 'inline',
        textAlign: 'left',
        float: 'left',
        paddingRight: 37.5
      },
    },
  },
  assets: {
    marginTop: -305
  },
  container: {
    width: '30em',
  },
  events: {
    width: '41.25em'
  },
  market: {
    position: 'absolute',
    paddingLeft: '1.75em',
    '& h2': {
      marginBottom: 0
    },
    '& h3': {
      marginTop: 15,
      color: '#999999',
    },
    '& h4': {
      marginTop: 15,
      color: '#999999',
    }
  },
}))

export default function Pools(){
  const [ data, setData ] = useState(dummy)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      setData(state.indexes['DEFII5'])
    }
  }, [ state.indexes ])

  function hash(value, og) {
    return (
      <a style={{ 'text-decoration': 'none' }} href={`https://rinkeby.etherscan.io/tx/${og}`} target='_blank'>
        <TransactionButton> <o>{value}</o>&nbsp;<Exit/> </TransactionButton>
      </a>
    )
  }

  const events = [
    { time: Date.now(), event: 'MINT 400 USDI3', tx: hash(shortenHash(txs[0]), txs[0]) },
    { time: Date.now(), event: 'BURN 300 USDI3', tx: hash(shortenHash(txs[1]), txs[1]) },
    { time: Date.now(), event: 'BURN 0.5 USDI3', tx: hash(shortenHash(txs[2]), txs[2]) },
    { time: Date.now(), event: 'MINT 0.125 USDI3', tx: hash(shortenHash(txs[3]), txs[3]) },
    { time: Date.now(), event: 'MINT 1,000 USDI3', tx: hash(shortenHash(txs[4]), txs[4]) },
  ]

  return (
    <Fragment>
      <Grid item container direction='column' alignItems='flex-start' justify='space-between'>
        <Grid item>
          <Chart>
            <div className={classes.market}>
              <h2> {data.name} [{data.symbol}] </h2>
              <h3> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h3>
            </div>
            <div className={classes.chart}>
              <Spline color='#ffa500' metadata={data} height={100} />
            </div>
            <div className={classes.stats}>
              <ul>
                <li> LIQUIDITY: {data.marketcap} </li>
                <li> MARKETCAP : {data.marketcap} </li>
              </ul>
            </div>
          </Chart>
        </Grid>
      <Grid item container direction='row' alignItems='flex-start' justify='space-between'>
        <Grid item>
          <Container margin='2em 0em 1.5em 3em' padding="1em 2em" percentage='20%' title='EVENTS'>
            <div className={classes.events}>
              <List height={200} columns={eventColumns} data={events} />
            </div>
          </Container>
        </Grid>
        <Grid item>
          <div className={classes.assets}>
            <Container margin='0em 3em' padding="1em 0em" percentage='27.5%' title='ASSETS'>
              <div className={classes.container}>
                <Approvals height='100%' metadata={data} />
              </div>
            </Container>
          </div>
        </Grid>
      </Grid>
      </Grid>
    </Fragment>
  )
}

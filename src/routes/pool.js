import React, { Fragment, useState, useEffect, useContext } from 'react'

import { makeStyles, styled } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import ExitIcon from '@material-ui/icons/ExitToApp'
import { useParams } from 'react-router-dom'

import Container from '../components/container'
import Spline from '../components/charts/spline'
import Canvas from '../components/canvas'
import Approvals from '../components/approvals'
import List from '../components/list'
import ButtonTransaction from '../components/buttons/transaction'
import ButtonPrimary from '../components/buttons/primary'

import PoolInitializer from '../assets/constants/abi/PoolInitializer.json'
import IERC20 from '../assets/constants/abi/IERC20.json'
import { eventColumns, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/pool'
import { getUnitializedPool } from '../api/gql'
import { toContract } from '../lib/util/contracts'
import { decToWeiHex } from '../lib/markets'
import getStyles from '../assets/css'
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
      <ButtonTransaction> <o>{value}</o>&nbsp;<Exit/> </ButtonTransaction>
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

const useStyles = getStyles(style)

export default function Pools(){
  const [ selections, setSelections ] = useState([])
  const [ instance, setInstance ] = useState(null)
  const [ credit, setCredit ] = useState(null)
  const [ data, setData ] = useState(dummy)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { address } = useParams()

  const getCreditQuote = async(assets) => {
    let newSelections = []
    let sum = 0

    for(let token in assets){
      let { address, amount } = assets[token]
      let value = decToWeiHex(state.web3.rinkeby, parseFloat(amount))
      let credit = await instance.methods.getCreditForTokens(address, value).call()

      sum += parseFloat(credit/Math.pow(10, 18)).toFixed(2)
    }

    setCredit(sum)
  }

  const pledgeTokens = async() => {
    let { web3, account } = state
    let { address } = instance.options
    let source = toContract(web3.injected, PoolInitializer.abi, address)
    let [addresses, amounts ] = getInputs()

    await source.methods.contributeTokens(
      addresses,
      amounts,
      0
    ).send({
      from: state.account
    })
  }

  const getInputs = () => {
    let [ inputs, targets] = [ [], [] ]
    let { web3 } = state

    for(let x in data.assets){
      let { name, address, symbol } = data.assets[x]
      let element = document.getElementsByName(symbol)[0]

      if(!isNaN(parseFloat(element.value))){
        let amount = decToWeiHex(web3.rinkeby, parseFloat(element.value))
        inputs.push(amount)
        targets.push(address)
      }
    }
    return [ targets, inputs ]
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes, web3 } = state
      let pool = await getUnitializedPool(address)
      let source = toContract(state.web3.rinkeby, PoolInitializer.abi, pool[0].id)

      if(Object.keys(indexes).length > 0){
        let target = Object.entries(indexes)
        .find(x => x[1].address == address)

        if(!target[1].active) {
          for(let token in pool[0].tokens){
            let { id } = pool[0].tokens[token]
            let address = id.split('-').pop()
            let contract = toContract(web3.rinkeby, IERC20.abi, address)
            let desired = await source.methods.getDesiredAmount(address).call()
            desired = (parseFloat(desired)/Math.pow(10,18)).toFixed(2)
            let symbol = await contract.methods.symbol().call()
            let { name } = tokenMetadata[symbol]

            target[1].assets.push({
              desired,
              address,
              symbol,
              name
            })
          }
        }
        setData(target[1])
      }
      setInstance(source)
    }
    retrievePool()
  }, [ state.indexes ])

  function hash(value, og) {
    return (
      <a style={{ 'text-decoration': 'none' }} href={`https://rinkeby.etherscan.io/tx/${og}`} target='_blank'>
        <ButtonTransaction> <o>{value}</o>&nbsp;<Exit/> </ButtonTransaction>
      </a>
    )
  }

  const events = [
    { time: 1203232, event: 'MINT 400 USDI3', tx: hash(shortenHash(txs[0]), txs[0]) },
    { time: 1203232, event: 'BURN 300 USDI3', tx: hash(shortenHash(txs[1]), txs[1]) },
    { time: 1203232, event: 'BURN 0.5 USDI3', tx: hash(shortenHash(txs[2]), txs[2]) },
    { time: 1203232, event: 'MINT 0.125 USDI3', tx: hash(shortenHash(txs[3]), txs[3]) },
    { time: 1203232, event: 'MINT 1,000 USDI3', tx: hash(shortenHash(txs[4]), txs[4]) },
  ]

  useEffect(() => {
    const retrieveBalances = async() => {
      let { assets } = data

      if(state.web3.injected){
        await dispatch({ type: 'BALANCE',
          payload: { assets }
        })
      }
     }
    retrieveBalances()
  }, [ state.web3.injected ])

  useEffect(() => {
    if(!state.load){
      dispatch({
        type: 'LOAD', payload: true
      })
    }
  }, [ ])

  let {
    marginX, margin, width, padding, height, fontSize
  } = style.getFormatting(state)

  return (
    <Fragment>
      <Grid container direction='column' alignItems='flex-start' justify='stretch'>
        <Grid item xs={12} md={12} lg={12} xl={12} container direction='row' alignItems='flex-start' justify='space-between'>
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Chart native={state.native}>
              <div className={classes.market}>
                {!state.native && (
                  <Fragment>
                    <h2> {data.name} [{data.symbol}] </h2>
                    <h3> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h3>
                  </Fragment>
                )}
                {state.native && (
                  <Fragment>
                    <h3> {data.name} [{data.symbol}] </h3>
                    <h4> {data.address.substring(0, 6)}...{data.address.substring(38, 64)} </h4>
                  </Fragment>
                )}
              </div>
              <div className={classes.chart}>
                <Spline padding={padding} state={state} color='#ffa500' metadata={data} height={height} />
              </div>
              <div className={classes.stats} style={{ fontSize }}>
                <ul>
                  <li> LIQUIDITY: {data.marketcap} </li>
                  <li> MARKETCAP : {data.marketcap} </li>
                </ul>
              </div>
            </Chart>
          </Grid>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Container margin={margin} padding="1em 0em" percentage='27.5%' title='ASSETS'>
              <div className={classes.container} style={{ width }}>
                <Approvals param='DESIRED' height={250} metadata={data} />
              </div>
              <div className={classes.reciept}>
                <p> ENTITLED TO: {credit}</p>
                <p> PLEDGE: </p>
              </div>
              <div className={classes.submit}>
                <ButtonPrimary variant='outlined' onClick={pledgeTokens}>
                  INITIALISE
                </ButtonPrimary>
              </div>
            </Container>
          </Grid>
        </Grid>
        <Grid item xs={12} md={7} lg={7} xl={7}>
          <Container margin={marginX} padding="1em 2em" percentage='20%' title='EVENTS'>
            <div className={classes.events}>
              <List height={200} columns={eventColumns} data={events} />
            </div>
          </Container>
        </Grid>
      </Grid>
    </Fragment>
  )
}

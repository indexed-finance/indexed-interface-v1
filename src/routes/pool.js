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
import MockERC20ABI from '../assets/constants/abi/MockERC20.json'
import { eventColumns, tokenMetadata } from '../assets/constants/parameters'
import style from '../assets/css/routes/pool'
import { getUnitializedPool } from '../api/gql'
import { toContract } from '../lib/util/contracts'
import { decToWeiHex, getBalances } from '../lib/markets'
import { prepareOracle } from '../lib/index'
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
  const [ instance, setInstance ] = useState(null)
  const [ data, setData ] = useState(dummy)
  const classes = useStyles()

  let { state, dispatch } = useContext(store)
  let { address } = useParams()

  const getCredit = async(targets) => {
    let element = document.getElementById('credit')
    let alternative = document.getElementById('eth-eqiv')
    let { toBN, toHex } = state.web3.rinkeby.utils
    let ethValue = 0
    let credit = 0

    if(targets.length <= 1){
      credit = await getCreditQuoteSingle(targets[0])
      ethValue = credit
      element.innerHTML = credit.toLocaleString(
          undefined, { minimumFractionDigits: 2 }
      ) + " ETH"
    } else {
      credit = await getCreditQuoteMultiple(targets, toBN(0))
      ethValue = parseFloat(credit.div(toBN(1e18)).toString())
      element.innerHTML = ethValue.toFixed(2) + " ETH"
    }

    alternative.innerHTML = '$' + parseFloat(ethValue * state.price).toFixed(2)
  }

  const getCreditQuoteSingle = async(asset) => {
    let { address, amount } = asset
    let value = decToWeiHex(state.web3.rinkeby, parseFloat(amount))
    let credit = await instance.methods.getCreditForTokens(address, value).call()

    return parseFloat(credit)/Math.pow(10, 18)
  }

  const getCreditQuoteMultiple = async(assets, total) => {
    for(let x in assets){
      let { address, amount } = assets[x]
      let value = decToWeiHex(state.web3.rinkeby, parseFloat(amount))
      let credit = await instance.methods.getCreditForTokens(address, value).call()
        .then(v => state.web3.rinkeby.utils.toBN(v))
        .catch(err => console.log(err))

      if (credit.eqn(0)) console.log(`Got zero credit output for ${address} amount ${amount}`);

      total = total.add(credit);
    }
    return total
  }

  const pledgeTokens = async() => {
    let { web3, account } = state
    let { address } = instance.options
    let source = toContract(web3.injected, PoolInitializer.abi, address)
    let [ addresses, amounts, output ] = await getInputs(web3.rinkeby)

    await source.methods.contributeTokens(
      addresses,
      amounts,
      output
    ).send({
      from: state.account
    })
  }

  const updateOracle = async() => {
    let { web3, account } = state
    await prepareOracle(web3.injected, account)
  }

  const getUnderlyingAssets = async() => {
    let { web3, account } = state

    for(let x in data.assets) {
      let { symbol, address } = data.assets[x]
      let amount = decToWeiHex(web3.injected, Math.floor(Math.random() * 10000))
      const token = new web3.injected.eth.Contract(MockERC20ABI, address)

      await token.methods.getFreeTokens(account, amount)
      .send({ from: account })
    }
  }

  const getInputs = async(web3) => {
    let { toBN } = web3.utils
    let [ inputs, targets ] = [ [], [] ]
    let value = 0

    for(let x in data.assets){
      let { name, address, symbol } = data.assets[x]
      let element = document.getElementsByName(symbol)[0]
      let value = parseFloat(element.value)

      if(!isNaN(value)){
        inputs.push(decToWeiHex(web3, value))
        targets.push(address)
      }
    }

    if(inputs.length > 1){
      let array = inputs.map((v, i) => { return { amount: v, address: targets[i] } })
      value = await getCreditQuoteMultiple(array, toBN(0))
    } else {
      let query = { address: targets[0], amount: inputs[0] }
      value = await getCreditQuoteSingle(query)
    }
    return [ targets, inputs, value ]
  }

  useEffect(() => {
    const retrievePool = async() => {
      let { indexes, web3 } = state
      let pool = await getUnitializedPool(address)

      if(Object.keys(indexes).length > 0 && pool[0] != undefined){
        let source = toContract(state.web3.rinkeby, PoolInitializer.abi, pool[0].id)
        let target = Object.entries(indexes)
        .find(x => x[1].address == address)

        target[1].address = pool[0].id
        target[1].credit = 0

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
        setInstance(source)
      }
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
      let { account, web3 } = state
      let { assets } = data

      if(web3.injected){
        let balances =  await getBalances(web3.rinkeby, account, assets, {})

        await dispatch({ type: 'BALANCE',
          payload: { balances }
        })
      }
     }
     const getActiveCredit = async() => {
       let { account, web3 } = state

       if(web3.injected && instance){
         let credit = await instance.methods.getCreditOf(account).call()
         credit = (parseFloat(credit)/Math.pow(10, 18)).toFixed(2)

         setData({ ...data, credit })
       }
     }
    retrieveBalances()
    getActiveCredit()
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
                  <li> MARKETCAP: {data.marketcap} </li>
                  <li> YOUR CREDITS: {data.credit} </li>
                </ul>
              </div>
            </Chart>
          </Grid>
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Container margin={margin} padding="1em 0em" title='ASSETS'>
              <div className={classes.container} style={{ width }}>
                <Approvals input={0} param='DESIRED' height={250} metadata={data} set={getCredit}/>
              </div>
              <div className={classes.reciept}>
                <p> ENTITLED TO: <span id='credit'/></p>
                <p> PLEDGE: <span id='eth-eqiv'/></p>
              </div>
              <div className={classes.submit}>
                <ButtonPrimary variant='outlined' onClick={updateOracle} style={{ marginLeft: 0, float: 'left' }}>
                  UPDATE
                </ButtonPrimary>
                <ButtonPrimary variant='outlined' onClick={pledgeTokens} style={{ marginLeft: 0 }}>
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

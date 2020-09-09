import React, { Fragment, useState, useEffect, useContext } from "react";

import { Link } from 'react-router-dom'
import { styled } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

import ButtonPrimary from '../components/buttons/primary'
import Container from '../components/container'
import Spline from '../components/charts/spline'
import Pie from '../components/charts/pie'
import Canvas from '../components/canvas'
import Table from '../components/table'

import indexed from '../assets/images/indexed.png'
import { store } from '../state'

const dummy = {
  'NA': {
    assets: [ 'WBTC', 'USDC', 'ETH', 'COMP', 'USDT', 'LINK', 'LEO' ],
    address: '0x208d174775dc39fe18b1b374972f77ddec6c0f73',
    weights: [ 50, 10, 25, 30, 37.5, 30, 10 ],
    name: 'Cryptocurrency',
    symbol: 'CCI',
    price: '$5,231.00',
    supply: '1,232,123',
    inflow: '$19,593,120',
    outflow: '$15,032,994',
    tvl: '$38,021,210',
    history: [{
        x: 1597865990111 * .55,
        y: 1675
      },{
        x: 1597865990111 * .60,
        y: 1775
      },{
        x: 1597865990111 * .65,
        y: 2200
      },{
        x: 1597865990111  * .70,
        y: 1750
      },{
        x: 1597865990111  * .725,
        y: 2750
      },{
        x: 1597865990111 * .75,
        y: 2000
      },{
        x: 1597865990111 * .8,
        y: 2443
      },{
        x: 1597865990111 * .85,
        y: 4503
      },{
        x: 1597865990111  * .90,
        y: 3000
      },{
        x: 1597865990111  * .95,
        y: 3750
      },{
        x: 1597865990111  * 1,
        y: 5100
      },{
        x: 1597865990111  * 1.05,
        y: 3750
      }]
  },
  'DEFII': {
    assets: [ 'SNX', 'COMP', 'AAVE', 'BAL', 'DAI', 'LINK', 'YFI', 'REN', 'LRC', 'MKR' ],
    address: '0xa6e562e5d24feca0fb1c690d9834e52de0cb51b1',
    weights: [ 15, 25, 20, 15, 10, 40, 30, 10, 10, 15 ],
    name: 'Decentralized Finance',
    symbol: 'DEFII',
    price: '$15,432.01',
    supply: '350,129,313',
    inflow: '$1,343,119',
    outflow: '$2,152,864',
    tvl: '$5,102,377',
    history: [{
        x: 1597865990111 * .55,
        y: 6000
      },{
        x: 1597865990111 * .60,
        y: 4215
      },{
        x: 1597865990111 * .65,
        y: 7250
      },{
        x: 1597865990111  * .70,
        y: 6500
      },{
        x: 1597865990111  * .725,
        y: 3575
      },{
        x: 1597865990111 * .75,
        y: 7500
      },{
        x: 1597865990111 * .8,
        y: 5000
      },{
        x: 1597865990111 * .85,
        y: 12502
      },{
        x: 1597865990111  * .90,
        y: 7500
      },{
        x: 1597865990111  * .95,
        y: 6431
      },{
        x: 1597865990111  * 1,
        y: 3750
      },{
        x: 1597865990111  * 1.05,
        y: 3750
      }]
  },
  'GOVI': {
    assets: [ 'COMP', 'YFI', 'MKR' ],
    address: '0x904da022abcf44eba68d4255914141298a7f7307',
    weights: [ 50, 10, 25 ],
    symbol: 'GOVI',
    name: 'Governance',
    price: '$7,031.97',
    supply: '5,321',
    inflow: '$250,232',
    outflow: '$75,041',
    tvl: '$1,883,120',
    history: [{
        x: 1597865990111 * .55,
        y: 20000
      },{
        x: 1597865990111 * .60,
        y: 8750
      },{
        x: 1597865990111 * .65,
        y: 15000
      },{
        x: 1597865990111  * .70,
        y: 10000
      },{
        x: 1597865990111  * .725,
        y: 7500
      },{
        x: 1597865990111 * .75,
        y: 12501
      },{
        x: 1597865990111 * .8,
        y: 15421
      },{
        x: 1597865990111 * .85,
        y: 12502
      },{
        x: 1597865990111  * .90,
        y: 15032
      },{
        x: 1597865990111  * .95,
        y: 9431
      },{
        x: 1597865990111  * 1,
        y: 7531
      },{
        x: 1597865990111  * 1.05,
        y: 23233
      }]
  }
}

const Trigger = styled(ButtonPrimary)({
  padding: '.3em 2.125em',
  marginTop: 25,
  marginLeft: 'auto',
  float: 'right',
})

const Wrapper = styled(Paper)({
  borderLeft: '5px solid #666666',
  borderRight: '3px solid #666666',
  borderTop: '3px solid #666666',
  borderBottom: '3px solid #666666',
  borderTopLeftRadius: 200,
  borderBottomLeftRadius: 200,
  borderTopRightRadius: 10,
  borderBottomRightRadius: 10,
  width: '32.5%',
  height: '13.375em',
  boxShadow: 'none',
  background: 'white',
  position: 'absolute',
  marginTop: '-.2em',
  right: '3.55%'
})

export default function Root(){
  const [ market, setMarket ] = useState(dummy['NA'])
  const [ pie, setPie ] = useState(<Fragment />)
  let { state, dispatch } = useContext(store)

  const changeMarket = (market) => {
    setMarket(dummy[market])
  }

  useEffect(() => {
    if(Object.keys(state.indexes).length > 0){
      console.log(state.indexes)
      setMarket(state.indexes['USDI3'])
    }
  }, [ state.indexes ])

  return (
    <Fragment>
      <Grid container direction='column' alignItems='space-between' justify='center'>
        <Grid item>
          <Canvas>
            <div className='market-select'>
              <h2> {market.name} [{market.symbol}] </h2>
              <h3> {market.price} </h3>
            </div>
            <Spline metadata={market} />
            <Wrapper>
              <Pie metadata={market} />
              <ul className='market-options'>
                <li>ADDRESS:
                  <span>
                    {market.address.substring(0, 6)}...{market.address.substring(38, 64)}
                  </span>
                </li>
                <li>SUPPLY: <span>{market.supply}</span> </li>
                <li>OUTFLOW: <span></span> </li>
                <li>INFLOW: <span></span></li>
                <li>TVL: <span>{market.marketcap}</span></li>
                <Link to={`index/${market.symbol.toLowerCase()}`}>
                  <Trigger> EXPLORE </Trigger>
                </Link>
              </ul>
            </Wrapper>
          </Canvas>
        </Grid>
        <Grid item>
          <Container percentage='11%' title='INDEXES' components={
            <Table indexes={state.indexes} market={market.symbol} triggerMarket={changeMarket} />
          }/>
        </Grid>
      </Grid>
    </Fragment>
  )
}
